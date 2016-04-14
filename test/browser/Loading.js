import { h, render, rerender } from 'preact';
import { route } from 'preact-router';
import Loading from 'components/Loading';
import 'style';

/*global sinon,expect*/

describe('Loading', () => {
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
    it('should render <Loading />', () => {
      render(<Loading />, scratch);

      expect(scratch.innerHTML).to.contain('Loading...');
    });
  });
});
