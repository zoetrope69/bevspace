require('offline-plugin/runtime').install();
import { h, render } from 'preact';
import App from './components/App';
import './style';

render(<App />, document.body);
