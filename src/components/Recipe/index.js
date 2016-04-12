import { h, Component } from 'preact';
import style from './style';

import Loading from '../Loading';

export default class Recipe extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      brewCreated: false
    };
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

    return (
      <div class={style.recipe}>
        <div class={style.info} style={recipe && { backgroundColor: recipe.color.style }}>
          <h1 class={style.name}>{recipe && recipe.name}</h1>
          <span class={style.author}>{recipe && recipe.author}</span>
        </div>
        {user && recipe && (
        <button class={`${style.button} ${style.buttonSuccess}`}
                onclick={this.handleClick}
                disabled={brewCreated}>
          {brewCreated ? 'Brew created...' : 'Create a brew!'}
        </button>
        )}
      </div>
    );
  }
}
