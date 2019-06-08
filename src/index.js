import React from 'react';
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReactDOM from 'react-dom';

import reducers from './reducers';
import App from './App';

const createStoreWithMiddleware = composeWithDevTools(applyMiddleware(
	promise
))(createStore);  

ReactDOM.render( 
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>
, document.querySelector('#app'));

module.hot.accept();