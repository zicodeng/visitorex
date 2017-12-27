import * as adminActions from 'components/admin/actions';

const initState = {
    user: null,
};

const adminReducers = (state = initState, action) => {
    switch (action.type) {
        case adminActions.SIGN_IN_FULFILLED:
            state = {
                ...state,
                user: action.payload.data,
            };
            break;

        case adminActions.SIGN_UP:
            break;

        case adminActions.SIGN_OUT:
            break;

        default:
            break;
    }

    return state;
};

export default adminReducers;
