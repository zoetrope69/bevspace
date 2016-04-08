import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Recipes extends Component {

  render() {
    const { processRecipe } = this.props;
    let { recipes } = this.props;

    return (
      <div class={style.recipes}>
        <h1>Recipes</h1>
        <ul class={style.list}>
          {recipes.map(recipe => (
            <li>
              <Link class={style.item} style={{ borderLeftColor: recipe.color.style }} href={`/recipe/${recipe._id}`}>
                <span>
                  <span class={style.name}>{recipe.name}</span>
                  <small class={style.author}>{recipe.author}</small>
                </span>
                <span>{recipe.ibu.toFixed(1)} <abbr style={{ display: 'block', fontSize: '.8em', letterSpacing: '.13em' }} title="International Bittering Units">IBU</abbr></span>
                <span>{recipe.abv.toFixed(1)}% <abbr style={{ display: 'block', fontSize: '.8em', letterSpacing: '.13em' }} title="Alcohol by Volume">ABV</abbr></span>
              </Link>
            </li>
          ))}
        </ul>
			</div>
		);
  }
}
