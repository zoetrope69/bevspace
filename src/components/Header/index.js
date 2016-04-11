import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { user } = this.props;
    return (
      <header class={style.header}>
        <Link href="/" class={style.logo}><h1>bevspace</h1></Link>
        <nav>
          <Link href="/recipes">Recipes</Link>
          {user && <Link href="/brews">Brews</Link>}
          <Link href="/profile">{user ? user.name : 'Login/Signup'}</Link>
        </nav>
      </header>
    );
  }
}
