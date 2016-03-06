require('offline-plugin/runtime').install();
import { h, render } from 'preact';
import App from './components/app';
import './style';

render(<App />, document.body);
