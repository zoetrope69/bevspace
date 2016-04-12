import Brauhaus from 'brauhaus';
import PouchDB from 'pouchdb';
import PouchDBAuth from 'pouchdb-authentication';
import { h, Component } from 'preact';
import { Router, route } from 'preact-router';
import { binarySearch } from '../utils';

import Alert from './Alert';
import Header from './Header';
import Home from './Home';
import Recipes from './Recipes';
import Recipe from './Recipe';
import Brews from './Brews';
import Brew from './Brew';
import Profile from './Profile';

// add the authentication plugin to pouchdb
PouchDB.plugin(PouchDBAuth);

// pouchdb state handling code based on: https://pouchdb.com/2015/02/28/efficiently-managing-ui-state-in-pouchdb.html

export default class App extends Component {
  constructor() {
    super();

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.signup = this.signup.bind(this);
    this.getUser = this.getUser.bind(this);

    const db = {
      recipes: {
        remote: new PouchDB(`${process.env.REMOTE_DB}/recipes`, { skipSetup: true }),
        local: new PouchDB('recipes')
      },
      brews: {
        remote: new PouchDB(`${process.env.REMOTE_DB}/brews`, { skipSetup: true }),
        local: new PouchDB('brews')
      }
    };

    // start syncing the databases
    db.recipes.syncHandler = db.recipes.local.sync(db.recipes.remote, { live: true, retry: true }).on('error', console.log.bind(console));
    db.brews.syncHandler = db.brews.local.sync(db.brews.remote, { live: true, retry: true }).on('error', console.log.bind(console));

    this.state = {
      db,
      serviceWorkerActivated: false,
      user: false,
      recipes: [],
      brews: []
    };
  }

	/** Gets fired when the route changes.
	 *	@param {Object} event "change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
  handleRoute = (event) => {
    const { user } = this.state;

    // redirect if no user for the brews section
    if (event.url.includes('/brew') && !user.name) {
      route('/profile');
    }

    this.currentUrl = event.url;
  };

  initServiceWorker() {
    // register the service worker
    new Promise((resolve, reject) => {
      // check to see if there are any registrations already
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration.unregister(); // debug remove service worker

        if (!registration || !registration.active) {
          console.log('No service worker registered. Registering service worker...');
          // Register the ServiceWorker
          navigator.serviceWorker.register('service-worker.js', {
            scope: '.'
          }).then((registration) => {
            console.log('The service worker has been registered ', registration);
            resolve();
          })
          .catch(() => {
            reject('Cant register a service worker yo');
          });
        }
      });
    })
    .then(() => {
      console.log('adding listeners for service worker shit');
      navigator.serviceWorker.addEventListener('controllerchange', (event) => {
        console.log('[controllerchange] A "controllerchange" event has happened within navigator.serviceWorker: ', event);

        navigator.serviceWorker.controller.addEventListener('statechange', (event) => {
          console.log('[controllerchange][statechange] A "statechange" has occured: ', event.target.state);

          if (event.target.state === 'activated') {
            this.setState({ serviceWorkerActivated: true });
          }
        });
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
  }

  fetchInitialRecipes() {
    const { local } = this.state.db.recipes;
    return local.allDocs({ include_docs: true }).then((res) => {
      const recipes = res.rows.map((row) => this.processRecipe(row.doc));
      this.setState({ recipes });
    });
  }

  onDeletedRecipe(id) {
    const { recipes } = this.state;
    const index = binarySearch(recipes, id);
    const recipe = recipes[index];

    if (recipe && recipe._id === id) {
      recipes.splice(index, 1);
      this.setState({ recipes });
    }
  }

  onUpdatedOrInsertedRecipe(newRecipe) {
    const { recipes } = this.state;
    const index = binarySearch(recipes, newRecipe._id);
    const recipe = recipes[index];

    if (recipe && recipe._id === newRecipe._id) { // update
      recipes[index] = this.processRecipe(newRecipe);
      this.setState({ recipes });
    } else { // insert
      recipes.splice(index, 0, this.processRecipe(newRecipe));
      this.setState({ recipes });
    }
  }

  processRecipe(recipe) {
    const processedRecipe = new Brauhaus.Recipe(recipe);
    processedRecipe.calculate();

    // generate the start of the output
    const output = processedRecipe.toJSON();

    // add information
    output.abv = processedRecipe.abv;
    output.ibu = processedRecipe.ibu;

    // add the brew color to the output
    output.color = {
      raw: processedRecipe.color,
      name: processedRecipe.colorName(),
      style: Brauhaus.srmToCss(processedRecipe.color.toFixed(1))
    };

    // get timeline for brew and tidy up data structure a bit
    let timeline = processedRecipe.timeline();
    timeline = timeline.map(item => {
      return {
        duration: {
          raw: item[0] * 60000, // minutes to milliseconds
          pretty: Brauhaus.displayDuration(item[0])
        },
        description: item[1]
      };
    });
    // add timeline to output
    output.timeline = timeline;

    // put in database info
    output._id = recipe._id;
    output._rev = recipe._rev;
    output.type = recipe.type;

    return output;
  }

  loadRecipes() {
    const { recipes, db } = this.state;
    // db.recipes.local.destroy().then(console.log('Database nuked')).catch(console.log.bind(console));

    // if there's no recipes fetch the initial recipes
    if (recipes.length < 1) {
      this.fetchInitialRecipes().catch(console.log.bind(console));
    }

    // now check if the local db changes
    db.recipes.local.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
      if (change.deleted) {
        // change.id holds the deleted id
        this.onDeletedRecipe(change.id);
      } else { // updated/inserted
        // change.doc holds the new doc
        this.onUpdatedOrInsertedRecipe(change.doc);
      }
    }).on('error', console.log.bind(console));
  }

  fetchInitialBrews() {
    const { local } = this.state.db.brews;
    return local.allDocs({ include_docs: true }).then((res) => {
      const brews = res.rows.map((row) => {
        if (!row.doc.recipe) {
          return false;
        }
        return row.doc;
      });
      this.setState({ brews });
    });
  }

  onDeletedBrew(id) {
    const { brews } = this.state;
    const index = binarySearch(brews, id);
    const brew = brews[index];

    if (brew && brew._id === id) {
      brews.splice(index, 1);
      this.setState({ brews });
    }
  }

  onUpdatedOrInsertedBrew(newBrew) {
    const { brews } = this.state;
    const index = binarySearch(brews, newBrew._id);
    const brew = brews[index];

    if (brew && brew.recipe && brew._id === newBrew._id) { // update
      brews[index] = newBrew;
      this.setState({ brews });
    } else { // insert
      brews.splice(index, 0, newBrew);
      this.setState({ brews });
    }
  }

  loadBrews() {
    const { brews, db } = this.state;
    // db.brews.local.destroy().then(console.log('Database nuked')).catch(console.log.bind(console));

    // if there's no brewss fetch the initial brewss
    if (brews.length < 1) {
      this.fetchInitialBrews().catch(console.log.bind(console));
    }

    // now check if the local db changes
    db.brews.local.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
      if (change.deleted) {
        // change.id holds the deleted id
        this.onDeletedBrew(change.id);
      } else { // updated/inserted
        // change.doc holds the new doc
        this.onUpdatedOrInsertedBrew(change.doc);
      }
    }).on('error', console.log.bind(console));
  }

  loadData() {
    this.loadRecipes();
    this.loadBrews();
  }

  componentWillUnmount() {
    // stop syncing the databases
    this.state.db.recipes.syncHandler.cancel();
    this.state.db.brews.syncHandler.cancel();
  }

  componentWillMount() {
    this.loadData();
    this.getUser();

    // this.initServiceWorker();
  }

  getUser() {
    const { remote } = this.state.db.brews;
    return remote.getSession((err, response) => {
      if (err) {
        console.log('session err', err);
        // network error
      } else if (!response.userCtx.name) {
        console.log('nobodys logged in');
      } else {
        this.setState({ user: response.userCtx });
      }
    });
  }

  login() {
    const { remote } = this.state.db.brews;
    remote.login('batman', 'brucewayne').then(this.getUser);
  }

  logout() {
    const { remote } = this.state.db.brews;
    remote.logout().then(this.setState({ user: false }));
  }

  signup(username, password) {
    const { remote } = this.state.db.brews;
    return remote.signup(username, password, (err, response) => {
      if (err) {
        if (err.name === 'conflict') {
          return console.log('"batman" already exists, choose another username');
        } else if (err.name === 'forbidden') {
          return console.log('invalid username', err);
        }

        return console.log('something went wrong');
      }

      console.log('response', response);
    });
  }

  render() {
    const { serviceWorkerActivated, recipes, brews, user } = this.state;
    // console.log('state', this.state);

    return (
			<div id="app">
        <Alert offline={serviceWorkerActivated} />
				<Header user={user} />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
          <Brews path="/brews"
                 user={user}
                 brews={brews}
                 recipes={recipes}
                 />
          <Brew path="/brew/:id"
                user={user}
                brews={brews}
                recipes={recipes}
                />
					<Recipes path="/recipes"
                   recipes={recipes}
                   />
					<Recipe path="/recipe/:id"
                  recipes={recipes}
                  />
					<Profile path="/profile"
                   user={user}
                   login={this.login}
                   logout={this.logout}
                   />
				</Router>
			</div>
		);
  }
}
