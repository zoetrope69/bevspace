import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    return (
      <header class={style.header}>
        <Link href="/" class={style.logo}><h1>bevspace</h1></Link>
        <nav>
          <Link href="/recipes">Recipes</Link>
        </nav>
      </header>
    );
  }
}
