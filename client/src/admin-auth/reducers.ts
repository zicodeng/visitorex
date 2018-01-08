import {
    SIGN_IN_FULFILLED,
    SIGN_UP_FULFILLED,
    SIGN_OUT_FULFILLED,
    FETCH_ADMIN_FULFILLED,
    FETCH_ADMIN_REJECTED,
    UPDATE_ADMIN,
} from 'admin-auth/actions';
import { removeSessionToken } from 'utils';

const initState = {
    user: null,
};

const adminReducers = (state = initState, action) => {
    switch (action.type) {
        case SIGN_IN_FULFILLED:
            state = {
                ...state,
                user: action.payload.data,
            };
            break;

        case SIGN_UP_FULFILLED:
            state = {
                ...state,
                user: action.payload.data,
            };
            break;

        case SIGN_OUT_FULFILLED:
            state = {
                ...state,
                user: null,
            };
            removeSessionToken();

            break;

        case FETCH_ADMIN_FULFILLED:
            state = {
                ...state,
                user: action.payload.data,
            };
            break;

        case FETCH_ADMIN_REJECTED:
            state = {
                ...state,
                user: null,
            };
            break;

        case UPDATE_ADMIN:
            // Add session token to admin.
            const updatedAdmin: any = Object.assign({}, state.user);
            updatedAdmin.sessionToken = action.payload;

            state = {
                ...state,
                user: updatedAdmin,
            };
            break;

        default:
            break;
    }
    return state;
};

export default adminReducers;
