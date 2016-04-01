import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Alert from './Alert';
import Header from './Header';
import Home from './Home';
import Recipes from './Recipes';
import Recipe from './Recipe';

export default class App extends Component {
  constructor() {
    super();
    // set initial time:
    this.state = {
      serviceWorkerActivated: false,
      fontsLoaded: false,
      recipes: []
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

  loadRecipes() {
    fetch('http://localhost:2337')
      .then((result) => result.json())
      .then((recipes) => this.setState({ recipes }));
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
