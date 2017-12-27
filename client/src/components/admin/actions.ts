import axios from 'axios';

import { getCurrentHost, storeSessionToken } from 'components/utils';
import { NewAdmin, AdminCredentials } from 'components/admin';
import { FormError } from 'components/material-form';
import * as materialFormActions from 'components/material-form/actions';

export const SIGN_IN = 'SIGN_IN';
export const SIGN_IN_PENDING = 'SIGN_IN_PENDING';
export const SIGN_IN_FULFILLED = 'SIGN_IN_FULFILLED';
export const SIGN_IN_REJECTED = 'SIGN_IN_REJECTED';

export const signIn = (credentials: AdminCredentials, formType: string) => {
    return dispatch =>
        dispatch({
            type: SIGN_IN,
            payload: axios.post(
                `https://${getCurrentHost()}/v1/sessions`,
                credentials,
            ),
        })
            .then(res => {
                // Hide error if this asyc call is successful.
                dispatch(materialFormActions.hideError());
                const sessionToken = res.value.headers.authorization;
                storeSessionToken(sessionToken);
            })
            .catch(error => {
                // If there is an error with this async call,
                // show this error on material form.
                const formError: FormError = {
                    message: error.response.data,
                    type: formType,
                };
                dispatch(materialFormActions.showError(formError));
            });
};

export const SIGN_UP = 'SIGN_UP';
export const SIGN_UP_PENDING = 'SIGN_UP_PENDING';
export const SIGN_UP_FULFILLED = 'SIGN_UP_FULFILLED';
export const SIGN_UP_REJECTED = 'SIGN_UP_REJECTED';

export const signUp = (newAdmin: NewAdmin, formType: string) => {
    return dispatch =>
        dispatch({
            type: SIGN_UP,
            payload: axios.post(
                `https://${getCurrentHost()}/v1/admins`,
                newAdmin,
            ),
        })
            .then(res => {
                dispatch(materialFormActions.hideError());
                const sessionToken = res.value.headers.authorization;
                storeSessionToken(sessionToken);
            })
            .catch(error => {
                const formError: FormError = {
                    message: error.response.data,
                    type: formType,
                };
                dispatch(materialFormActions.showError(formError));
            });
};

export const SIGN_OUT = 'SIGN_OUT';
