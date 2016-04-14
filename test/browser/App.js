import { h, render, rerender } from 'preact';
import { route } from 'preact-router';
import App from 'components/App';
import 'style';

/*global sinon,expect*/

describe('App', () => {
  let scratch;

  before( () => {
    scratch = document.createElement('div');
    (document.body || document.documentElement).appendChild(scratch);
  });

  beforeEach( () => {
    scratch.innerHTML = '';
  });

  after( () => {
    scratch.parentNode.removeChild(scratch);
    scratch = null;
  });

  describe('routing', () => {
    it('should render the page', () => {
      render(<App />, scratch);

      expect(scratch.innerHTML).to.contain('<h1>bevspace</h1>');
    });

    it('should render the home page', () => {
      render(<App />, scratch);
      route('/');
      rerender();

      expect(scratch.innerHTML).to.contain('Home');
    });

    it('should render /profile', () => {
      render(<App />, scratch);
      route('/profile');
      rerender();

      expect(scratch.innerHTML).to.contain('Hey');
    });
  });
});
