import axios from 'axios';

import { fetchAdmin } from 'admin-auth/actions';
import { fetchOffices } from 'dashboard/actions';

export const fetchOfficeOptions = () => {
    return dispatch =>
        dispatch(fetchAdmin()).then(() => {
            dispatch(fetchOffices());
        });
};
