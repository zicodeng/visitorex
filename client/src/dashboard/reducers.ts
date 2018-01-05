import {
    FETCH_OFFICES_FULFILLED,
    FETCH_VISITORS_FULFILLED,
    NEW_OFFICE_FULFILLED,
    NEW_VISITOR_NOTIFICATION,
    NEW_VISITOR_FULFILLED,
} from 'dashboard/actions';
import { Visitor, Office } from 'dashboard/interfaces';
import { convertToURLFormat } from 'dashboard/sidebar/utils';

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
            break;

        // Triggered by websocket.
        case NEW_VISITOR_NOTIFICATION:
            const visitor = action.payload.data;
            offices.forEach(office => {
                if (office.id === visitor.officeID) {
                    if (!office.visitors) {
                        office.visitors = [];
                    }
                    office.visitors.push(visitor);
                }
            });
            state = {
                ...state,
                offices: offices,
            };
            break;

        // Triggered by check-in form submission.
        case NEW_VISITOR_FULFILLED:
            window.location.assign('/thank-you');
            break;

        default:
            break;
    }
    return state;
};

export default dashboardReducers;
