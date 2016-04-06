import { h, Component } from 'preact';
import style from './style';
import Brauhaus  from 'brauhaus';

export default class Recipe extends Component {

  processRecipe(doc) {
    const recipe = new Brauhaus.Recipe(doc);
    recipe.calculate();

    // generate the start of the output
    const output = recipe.toJSON();

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
    const { id, recipes } = this.props;

    let recipe = recipes.find((recipe) => recipe._id === id);
    
    let output;

    if (recipe) {

      recipe = this.processRecipe(recipe);

      output = (
      <div>
        <div class={style.info} style={{ background: recipe.color.style }}>
          <h1 class={style.name}>{recipe.name}</h1>
          <span class={style.author}>{recipe.author}</span>
        </div>
        <ul class={style.timeline}>
          {recipe.timeline.map((item) => (
            <li class={style.item}>
              <time datetime={item.duration.raw}>{item.duration.pretty}</time>
              <span class={style.description}>{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
      );
    } else {
      output = <p>Loading...</p>;
    }

    return (
      <div class={style.recipe}>
        {output}
      </div>
    );
  }
}
