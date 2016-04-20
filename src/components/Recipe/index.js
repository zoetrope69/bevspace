import { h, Component } from 'preact';
import style from './style';

export default class Recipe extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      brewCreated: false,
    };
  }

  componentWillUnmount() {
    this.setState({ brewCreated: false });
  }

  handleClick(event) {
    const { id, createBrew } = this.props;

    createBrew(id).then(this.setState({ brewCreated: true }));

    event.preventDefault();
  }

  render() {
    const { id, recipes, user } = this.props;
    const { brewCreated } = this.state;

    const recipe = recipes.find((recipe) => recipe._id === id);

    // if no recipes its loading so show a placeholder
    if (!recipes.length) {
      return (
        <div>
          <div class={style.placeholder} />
          <div class={style.placeholder} />
        </div>
      );
    }

    return (
      <div class={style.recipe}>
        <div class={style.info} style={recipe.color && { backgroundColor: recipe.color.style }}>
          <h1 class={style.name}>{recipe && recipe.name}</h1>
          <span class={style.author}>{recipe && recipe.author}</span>
        </div>

        <div class={style.attributes}>
        {recipe.ibu && (
        <div class={style.ibuAbv}>
          {recipe.ibu.toFixed(1)}
          <abbr class={style.abbr} title="International Bittering Units">IBU</abbr>
        </div>
        )}
        {recipe.abv && (
        <div class={style.ibuAbv}>
          {recipe.abv.toFixed(1)}%
          <abbr class={style.abbr} title="Alcohol by Volume">ABV</abbr>
        </div>
        )}
        </div>

        <div class={style.attributes}>
          {recipe.fermentables.length && (
          <div class={style.ingredientsWrap}>
            <h2>Fermentables</h2>
            <ol class={style.ingredients}>
              {recipe.fermentables.map(fermentable => <li class={style.ingredient}>{fermentable.name}</li>)}
            </ol>
          </div>
          )}

          {recipe.spices.length && (
          <div class={style.ingredientsWrap}>
            <h2>Spices</h2>
            <ol class={style.ingredients}>
              {recipe.spices.map(spice => <li class={style.ingredient}>{spice.name}</li>)}
            </ol>
          </div>
          )}

          {recipe.yeast.length && (
          <div class={style.ingredientsWrap}>
            <h2>Yeast</h2>
            <ol class={style.ingredients}>
              {recipe.yeast.map(yeast => <li class={style.ingredient}>{yeast.name}</li>)}
            </ol>
          </div>
          )}
        </div>

        {recipe && (
        <button class={`${style.button} ${style.buttonSuccess}`}
                onclick={this.handleClick}
                disabled={!user || brewCreated}>
          {!user && 'Login to '}
          {brewCreated ? 'Brew created...' : 'Create a brew!'}
        </button>
        )}
      </div>
    );
  }
}
