import Brauhaus  from 'brauhaus';
import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Recipes extends Component {

  processRecipe(doc) {
    const recipe = new Brauhaus.Recipe(doc);
    recipe.calculate();

    // generate the start of the output
    const output = recipe.toJSON();

    // other info
    output.description = recipe.description;

    output.abv = recipe.abv;
    output.ibu = recipe.ibu;

    // add the brew color to the output
    output.color = {
      raw: recipe.color,
      name: recipe.colorName(),
      style: Brauhaus.srmToCss(recipe.color.toFixed(1))
    };

    // get timeline for brew and tidy up data structure a bit
    let timeline = recipe.timeline();
    timeline = timeline.map(item => {
      return {
        duration: {
          raw: item[0],
          pretty: Brauhaus.displayDuration(item[0])
        },
        description: item[1]
      };
    });
    // add timeline to output
    output.timeline = timeline;

    // put in database info
    output._id = doc._id;
    output._rev = doc._rev;
    output.type = doc.type;

    return output;
  }

  render() {
    let { recipes } = this.props;
    // console.log(recipes);

    recipes = recipes.map(this.processRecipe);

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
