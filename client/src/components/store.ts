import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from 'components/root-reducer';

// Middleware order matters!
// thunk needs to be placed before logger in order to avoid undefined action error.
const middleware = applyMiddleware(thunk, logger, promiseMiddleware());
const store = createStore(rootReducer, middleware);

export default store;
