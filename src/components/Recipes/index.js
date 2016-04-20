import { h, Component } from 'preact';
import style from './style';

import Loading from '../Loading';
import RecipesList from '../RecipesList';

export default class Recipes extends Component {

  render() {
    const { processRecipe } = this.props;
    let { recipes } = this.props;

    return (
      <div class={style.recipes}>
        <h1>Recipes</h1>
        <RecipesList recipes={recipes} loading={!recipes.length} />
			</div>
		);
  }
}
