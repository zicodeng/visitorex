import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import logger from 'redux-logger';

import rootReducer from 'components/root-reducer';

const middleware = applyMiddleware(logger, promiseMiddleware());
const store = createStore(rootReducer, middleware);

export default store;
