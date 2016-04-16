import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Loading from '../Loading';

export default class Recipes extends Component {

  render() {
    const { processRecipe } = this.props;
    let { recipes } = this.props;

    // if there are no recipes show a loading message
    if (!recipes.length) {
      return <Loading />;
    }

    return (
      <div class={style.recipes}>
        <h1>Recipes</h1>
        <ul class={style.list}>
          {recipes.map(recipe => (
            <li>
              <Link class={`${style.button} ${style.item}`}
                    style={{ borderLeftColor: recipe.color.style }}
                    href={`/recipe/${recipe._id}`}>
                <div>
                  <span class={style.name}>{recipe.name}</span>
                  <small class={style.author}>{recipe.author}</small>
                </div>
                <div>
                  {recipe.ibu.toFixed(1)}
                  <abbr class={style.abbr} title="International Bittering Units">IBU</abbr>
                </div>
                <div>
                  {recipe.abv.toFixed(1)}%
                  <abbr class={style.abbr} title="Alcohol by Volume">ABV</abbr>
                </div>
              </Link>
            </li>
          ))}
        </ul>
			</div>
		);
  }
}
