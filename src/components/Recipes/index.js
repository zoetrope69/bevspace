import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Recipes extends Component {
  render() {
    const { recipes } = this.props;

    return (
      <div class={style.recipes}>
        <h1>Recipes</h1>
        <ul class={style.list}>
          {recipes.map(recipe => (
            <li>
              <Link class={style.item} style={{ borderColor: recipe.color.style }} href={`/recipe/${recipe._id}`}>
                <span>{recipe.name}</span>
              </Link>
            </li>
          ))}
        </ul>
			</div>
		);
  }
}
