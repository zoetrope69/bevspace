import { h, Component } from 'preact';
import style from './style';

import Loading from '../Loading';
import BrewsList from '../BrewsList';

export default class Brews extends Component {

  render() {
    let { user, brews, recipes } = this.props;

    return (
    <div class={style.brews}>
      <h1>Brews</h1>
      <BrewsList user={user} brews={brews} recipes={recipes} loading={!recipes.length || !brews.length} />
    </div>
    );
  }
}
