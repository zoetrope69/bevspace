import { h, Component } from 'preact';
import style from './style';

export default class Alert extends Component {
  render(props, state) {
    const { offline } = this.props;

    let alertHidden;
    if (!offline) {
      alertHidden = style['alert--hidden'];
    }

    return (
			<div class={`${style.alert} ${alertHidden}`}>Ready to work offline!</div>
		);
  }
}
