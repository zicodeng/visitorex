import { OPEN_MODAL, CLOSE_MODAL } from 'components/modal/actions';

const initState = {
    show: false,
};

const modalReducers = (state = initState, action) => {
    switch (action.type) {
        case OPEN_MODAL:
            state = {
                ...state,
                show: action.payload,
            };
            break;

        case CLOSE_MODAL:
            state = {
                ...state,
                show: action.payload,
            };
            break;

        default:
            break;
    }
    return state;
};

export default modalReducers;
