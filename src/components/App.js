import config from 'config';
import { h, Component } from 'preact';
import { Router } from 'preact-router';
import PouchDB from 'pouchdb';

import Alert from './Alert';
import Header from './Header';
import Home from './Home';
import Recipes from './Recipes';
import Recipe from './Recipe';

// pouchdb state handling code from: https://pouchdb.com/2015/02/28/efficiently-managing-ui-state-in-pouchdb.html

function binarySearch(arr, docId) {
  let low = 0, high = arr.length, mid;

  while (low < high) {
    mid = Math.floor((low + high) / 2);
    if (arr[mid]._id < docId) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export default class App extends Component {
  constructor() {
    super();

    // set initial time:
    this.state = {
      serviceWorkerActivated: false,
      fontsLoaded: false,
      recipes: [],
      db: new PouchDB(config.db.remote),
      localDb: new PouchDB(config.db.local)
    };
  }

	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */

  handleRoute = event => {
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

  fetchInitialDocs() {
    return this.state.localDb.allDocs({ include_docs: true }).then((res) => {
      const recipes = res.rows.map((row) => row.doc);
      this.setState({ recipes });
    });
  }

  reactToChanges() {
    this.state.localDb.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
      if (change.deleted) {
        // change.id holds the deleted id
        this.onDeleted(change.id).bind(this);
      } else { // updated/inserted
        // change.doc holds the new doc
        this.onUpdatedOrInserted(change.doc).bind(this);
      }
      renderDocsSomehow();
    }).on('error', console.log.bind(console));
  }

  onDeleted(id) {
    const index = binarySearch(docs, id);
    const doc = docs[index];

    if (doc && doc._id === id) {
      docs.splice(index, 1);
    }
  }

  onUpdatedOrInserted(newDoc) {
    const index = binarySearch(docs, newDoc._id);
    const doc = docs[index];

    if (doc && doc._id === newDoc._id) { // update
      docs[index] = newDoc;
    } else { // insert
      docs.splice(index, 0, newDoc);
    }
  }

  loadRecipes() {
    this.fetchInitialDocs()
      .then(this.reactToChanges)
      .catch(console.log.bind(console));
  }

  componentWillMount() {
    this.state.localDb
      .sync(this.state.db, { live: true, retry: true })
      .on('error', console.log.bind(console));

    if (this.state.recipes.length < 1) {
      this.loadRecipes();
    }
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
