import {
    SIGN_IN_FULFILLED,
    SIGN_UP_FULFILLED,
    FETCH_ADMIN_FULFILLED,
} from 'components/admin-auth/actions';

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

        case FETCH_ADMIN_FULFILLED:
            state = {
                ...state,
                user: action.payload.data,
            };

        default:
            break;
    }
    return state;
};

export default adminReducers;
