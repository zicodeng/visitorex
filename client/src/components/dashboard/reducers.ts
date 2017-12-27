import {
    FETCH_OFFICES_FULFILLED,
    FETCH_VISITORS_FULFILLED,
} from 'components/dashboard/actions';
import { Visitor, Office } from 'components/dashboard';

const initState = {
    offices: [],
};

const dashboardReducers = (state = initState, action) => {
    switch (action.type) {
        case FETCH_OFFICES_FULFILLED:
            state = {
                ...state,
                offices: action.payload.data,
            };
            break;

        case FETCH_VISITORS_FULFILLED:
            // Get current state.
            const offices = state.offices;
            action.payload.forEach((payload, i) => {
                const office: Office = offices[i];
                const visitors: Visitor[] = payload.data;
                office.visitors = visitors;
            });
            state = {
                ...state,
                offices: offices,
            };
            break;

        default:
            break;
    }
    return state;
};

export default dashboardReducers;
