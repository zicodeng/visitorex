import axios from 'axios';

import { getCurrentHost, getSessionToken } from 'utils';
import { fetchAdmin } from 'admin-auth/actions';
import { fetchOffices, newOffice } from 'dashboard/actions';
import { Visitor } from 'dashboard/interfaces';
import { FormError } from 'components/material-form';

import { hideError, showError } from 'components/material-form/actions';

export const fetchOfficeOptions = () => {
    return dispatch =>
        dispatch(fetchAdmin()).then(() => {
            dispatch(fetchOffices());
        });
};
