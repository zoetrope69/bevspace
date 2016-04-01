import { h, Component } from 'preact';
import style from './style';

export default class Home extends Component {
  render() {
    return (
      <div class={style.home}>
        <h1>Home</h1>
        <p>Welcome to bev.space&hellip;</p>
      </div>
    );
  }
}
