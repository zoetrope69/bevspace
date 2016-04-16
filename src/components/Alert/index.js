import { h, Component } from 'preact';
import style from './style';

export default class Alert extends Component {
  render(props, state) {
    const { serviceWorkerActivated, recipes } = this.props;

    // if the service worker is activated and there isnt any recipes synced
    // hide the alert saying its ready to work offline
    let alertHidden;
    if (!serviceWorkerActivated && !recipes.length) {
      alertHidden = style['alert--hidden'];
    }

    return (
			<div class={`${style.alert} ${alertHidden}`}>Ready to work offline!</div>
		);
  }
}
