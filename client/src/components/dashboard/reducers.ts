import {
    FETCH_OFFICES_FULFILLED,
    FETCH_VISITORS_FULFILLED,
    NEW_OFFICE_FULFILLED,
} from 'components/dashboard/actions';
import { Visitor, Office } from 'components/dashboard/interfaces';
import { convertToURLFormat } from 'components/dashboard/sidebar/utils';

const offices: Office[] = [];
const initState = {
    offices: offices,
};

const dashboardReducers = (state = initState, action) => {
    // Get current state.
    let offices = state.offices;

    switch (action.type) {
        case FETCH_OFFICES_FULFILLED:
            state = {
                ...state,
                offices: action.payload.data,
            };
            break;

        case FETCH_VISITORS_FULFILLED:
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

        case NEW_OFFICE_FULFILLED:
            const newOffice = action.payload.data;
            offices.push(newOffice);
            state = {
                ...state,
                offices: offices,
            };

            // Redirect to new office panel.
            window.location.replace(
                `/dashboard/offices/${convertToURLFormat(newOffice.name)}`,
            );
            break;

        default:
            break;
    }
    return state;
};

export default dashboardReducers;
