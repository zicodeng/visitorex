import { combineReducers } from 'redux';

import adminReducers from 'admin-auth/reducers';
import checkinReducers from 'check-in/reducers';
import dashboardReducers from 'dashboard/reducers';
import materialFormReducers from 'components/material-form/reducers';
import modalReducers from 'components/modal/reducers';

export default combineReducers({
    admin: adminReducers,
    checkin: checkinReducers,
    materialForm: materialFormReducers,
    dashboard: dashboardReducers,
    modal: modalReducers,
});
