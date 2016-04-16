import { h, Component } from 'preact';
import style from './style';

export default class Profile extends Component {
  render() {
    const { username, password } = this.state;
    const { user, login, logout } = this.props;

    return (
      <div class={style.profile}>
        <h1>Hey{user && `, ${user.name}`}</h1>

        {user ? (
        <div>
          <button class={style.button} onclick={logout}>Logout</button>
        </div>
        ) : (
        <div>
          <button class={style.button} onclick={login}>Login</button>
        </div>
        )}
      </div>
    );
  }
}
