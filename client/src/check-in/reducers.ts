import { UPDATE_OFFICE_OPTION } from 'check-in/actions';

const initState = {
    office: '',
};

const checkinReducers = (state = initState, action) => {
    switch (action.type) {
        case UPDATE_OFFICE_OPTION:
            state = {
                ...state,
                office: action.payload,
            };
            break;

        default:
            break;
    }
    return state;
};

export default checkinReducers;
