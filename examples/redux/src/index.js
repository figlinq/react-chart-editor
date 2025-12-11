import './index.css';
import App from './App';
import {createRoot} from 'react-dom/client';
import reducer from './reducer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

const store = createStore(reducer);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
