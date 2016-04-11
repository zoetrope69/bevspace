import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Brews extends Component {

  render() {
    let { user, brews, recipes } = this.props;

    if (!user.name) {
      return (
      <div style={{ padding: '1em' }}>
        <h1>Brews</h1>

        <p>Need to be logged in for this</p>
      </div>
      );
    }

    return (
      <div style={{ padding: '1em' }}>
        <h1>Brews</h1>
        <ul class={style.brews}>
          {brews.map((brew, i) => {
            // if the brew isn't valid (duck typing here) or it's not ya brew
            if (!brew.recipe || brew.user !== user.name) {
              return false;
            }

            const recipe = recipes.find((recipe) => recipe._id === brew.recipe);

            return (
            <li class={style.list}>
              <Link class={style.item} href={`/brew/${brew._id}`}>
                <span>{recipe && recipe.name}</span>
              </Link>
            </li>
            );
          })}
        </ul>
			</div>
		);
  }
}
