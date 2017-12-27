import { combineReducers } from 'redux';

import adminReducers from 'components/admin/reducers';
import materialFormReducers from 'components/material-form/reducers';

export default combineReducers({
    admin: adminReducers,
    materialForm: materialFormReducers,
});
