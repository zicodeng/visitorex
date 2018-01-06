import { UPDATE_OFFICE_OPTION } from 'check-in/actions';

const initState = {
    officeOption: '',
};

const checkinReducers = (state = initState, action) => {
    switch (action.type) {
        case UPDATE_OFFICE_OPTION:
            state = {
                ...state,
                officeOption: action.payload,
            };
            break;

        default:
            break;
    }
    return state;
};

export default checkinReducers;
