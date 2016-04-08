import config from 'config';
import Brauhaus from 'brauhaus';
import PouchDB from 'pouchdb';
import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { binarySearch } from '../utils';

import Alert from './Alert';
import Header from './Header';
import Home from './Home';
import Recipes from './Recipes';
import Recipe from './Recipe';

// pouchdb state handling code based on: https://pouchdb.com/2015/02/28/efficiently-managing-ui-state-in-pouchdb.html

export default class App extends Component {
  constructor() {
    super();

    const remoteDb = new PouchDB(config.db.remote);
    const localDb = new PouchDB(config.db.local);

    const syncHandler = localDb.sync(remoteDb, { live: true, retry: true })
      .on('change', (info) => {
        // handle change
        console.log('Database synced!');
      }).on('paused', () => {
        // replication paused (e.g. user went offline)
      }).on('active', () => {
        // replicate resumed (e.g. user went back online)
      }).on('denied', (info) => {
        // a document failed to replicate (e.g. due to permissions)
      }).on('complete', (info) => {
        // handle complete
      }).on('error', (err) => {
        // handle error
        console.log('Database syncing error', error);
      });

    // set initial time:
    this.state = {
      serviceWorkerActivated: false,
      fontsLoaded: false,
      recipes: [],
      remoteDb,
      localDb,
      syncHandler
    };
  }

	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
  handleRoute = (event) => {
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
      console.log(error);
    });
  }

  fetchInitialRecipes() {
    return this.state.localDb.allDocs({ include_docs: true }).then((res) => {
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
          raw: item[0],
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
    const { recipes, localDb } = this.state;
    // localDb.destroy().then(console.log('Database nuked')).catch(console.log.bind(console));

    // if there's no recipes fetch the initial recipes
    if (recipes.length < 1) {
      this.fetchInitialRecipes().catch(console.log.bind(console));
    }

    // now check if the local db changes
    localDb.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
      if (change.deleted) {
        // change.id holds the deleted id
        this.onDeletedRecipe(change.id);
      } else { // updated/inserted
        // change.doc holds the new doc
        this.onUpdatedOrInsertedRecipe(change.doc);
      }
    }).on('error', console.log.bind(console));
  }

  componentWillUnmount() {
    const { syncHandler } = this.state;
    syncHandler.cancel();
  }

  componentWillMount() {
    this.loadRecipes();

    // this.initServiceWorker();
  }

  render() {
    const { serviceWorkerActivated, recipes } = this.state;

    return (
			<div id="app">
        <Alert offline={serviceWorkerActivated} />
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Recipes path="/recipes" recipes={recipes} />
					<Recipe path="/recipe/:id" recipes={recipes} />
				</Router>
			</div>
		);
  }
}
