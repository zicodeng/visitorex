import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from 'root-reducer';

// Middleware order matters!
// thunk needs to be placed before logger in order to avoid undefined action error.
let middleware = [thunk, promiseMiddleware()];
if (process.env.NODE_ENV !== 'production') {
    middleware = [...middleware, logger];
}

const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
