import { h, render, rerender } from 'preact';
import { route } from 'preact-router';
import Profile from 'components/Profile';
import 'style';

/*global sinon,expect*/

describe('Profile', () => {
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

  describe('rendering', () => {
    it('should render <Profile /> with no user', () => {
      render(<Profile user={null} />, scratch);

      console.log(scratch.innerHTML);

      expect(scratch.innerHTML).to.contain('<h1>Hey</h1>');
    });

    it('should render <Profile /> with user', () => {
      const name = 'Rich Boakes';
      render(<Profile user={{ name }} />, scratch);

      expect(scratch.innerHTML).to.contain(`<h1>Hey, ${name}</h1>`);
    });
  });
});
