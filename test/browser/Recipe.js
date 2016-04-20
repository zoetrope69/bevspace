import { h, render, rerender } from 'preact';
import { route } from 'preact-router';
import Recipe from 'components/Recipe';
import 'style';

/*global sinon,expect*/

describe('Recipe', () => {
  let scratch;
  let user;

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
    user = null;
  });

  describe('rendering', () => {
    const _id = 'cool_id_bro';
    const user = { name: 'batman' };
    const recipes = [
      {
        _id,
        name: "The Amazing Lemonade Brew",
        author: 'Rich Boakes',
        color: { style: 'blue' },
        fermentables: [],
        spices: [],
        yeast: [],
      },
    ];

    it('should render <Recipe /> with the right background color', () => {
      render(<Recipe id={_id} recipes={recipes} />, scratch);

      expect(scratch.innerHTML).to.contain('style="background-color: blue;"');
    });

    it('should render <Recipe /> with button if user', () => {
      render(<Recipe id={_id} recipes={recipes} user={user} />, scratch);

      expect(scratch.innerHTML).to.contain('Create a brew!');
    });

    it('should render <Recipe /> with no button if no user', () => {
      render(<Recipe id={_id} recipes={recipes} />, scratch);

      console.log(scratch.innerHTML);

      expect(scratch.innerHTML).to.contain('Login to Create a brew!');
    });
  });
});
