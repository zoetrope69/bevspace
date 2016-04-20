import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Progress from '../Progress';

export default class RecipesList extends Component {

  render() {
    const { recipes, loading } = this.props;

    // generate some placeholders for optimistically loading
    const placeholders = [];
    const placeholdersAmount =  25;
    for (let i = 0; i < placeholdersAmount; i++) {
      placeholders.push(<div class={style.placeholder} />);
    }

    return (
      <ul class={style.list}>
        {loading ? placeholders : recipes.map((recipe, i) => {

          // need at least a recipe to render
          if (!recipe.name) {
            return <div />;
          }

          return (
          <li key={i}>
            <Link class={`${style.button} ${style.item}`}
                  style={recipe.color && { borderLeftColor: recipe.color.style }}
                  href={`/recipe/${recipe._id}`}>
              <div>
                <span class={recipe.name}>{recipe.name}</span>
                {recipe.author && <small class={style.author}>{recipe.author}</small>}
              </div>
              {recipe.ibu && (
              <div>
                {recipe.ibu.toFixed(1)}
                <abbr class={style.abbr} title="International Bittering Units">IBU</abbr>
              </div>
              )}
              {recipe.abv && (
              <div>
                {recipe.abv.toFixed(1)}%
                <abbr class={style.abbr} title="Alcohol by Volume">ABV</abbr>
              </div>
              )}
            </Link>
          </li>
        );

        })}
      </ul>
    );
  }
}
