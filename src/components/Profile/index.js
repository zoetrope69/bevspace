import { h, Component } from 'preact';
import style from './style';

export default class Profile extends Component {

  render() {
    const { username, password } = this.state;
    const { user, login, logout } = this.props;

    return (
      <div class={style.profile}>
        <h1>{user ? `Hey, ${user.name}` : 'Login'}</h1>

        {user ? (
        <div>
          <button class={`${style.button} ${style.buttonFail}`} onclick={logout}>Logout</button>
        </div>
        ) : (
        <div>
          <input type="text" value="homer"/>
          <input type="password" value="doh"/>
          <button class={`${style.button} ${style.buttonSuccess}`} onclick={login}>Login</button>
        </div>
        )}
      </div>
    );
  }
}
