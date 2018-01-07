import {
    FETCH_OFFICES_FULFILLED,
    FETCH_VISITORS_FULFILLED,
    NEW_OFFICE_NOTIFICATION,
    NEW_VISITOR_NOTIFICATION,
    CLEAR_NEW_VISITORS,
} from 'dashboard/actions';
import { Visitor, Office } from 'dashboard/interfaces';
import { convertToURLFormat } from 'dashboard/sidebar/utils';

const initState = {
    offices: new Map(),
    visitors: new Map(),
    newVisitors: new Map(), // Used for sending notification.
};

const dashboardReducers = (state = initState, action) => {
    // Always create new maps by copying values from existing maps.
    const offices = new Map(state.offices);
    const visitors = new Map(state.visitors);
    const newVisitors = new Map(state.newVisitors);

    switch (action.type) {
        case FETCH_OFFICES_FULFILLED:
            const fetchedOffices = action.payload.data;
            fetchedOffices.forEach((office, i) => {
                // For React list key prop.
                office.key = i;
                offices.set(office.id, office);
            });

            state = {
                ...state,
                offices: offices,
            };
            break;

        case FETCH_VISITORS_FULFILLED:
            action.payload.forEach(item => {
                const fetchedVisitors = item.data;
                if (fetchedVisitors.length) {
                    const officeID = fetchedVisitors[0].officeID;
                    visitors.set(officeID, fetchedVisitors);
                }
            });

            state = {
                ...state,
                visitors: visitors,
            };
            break;

        case NEW_OFFICE_NOTIFICATION:
            const newOffice = action.payload;
            newOffice.key = offices.size;
            offices.set(newOffice.id, newOffice);

            state = {
                ...state,
                offices: offices,
            };
            break;

        // Triggered by websocket.
        case NEW_VISITOR_NOTIFICATION:
            const newVisitor = action.payload;

            // Add this new visitor to visitors map.
            if (!visitors.has(newVisitor.officeID)) {
                const visitorList: Visitor[] = [];
                visitors.set(newVisitor.officeID, visitorList);
            }
            const updatedVisitors = visitors
                .get(newVisitor.officeID)
                .concat(newVisitor);
            visitors.set(newVisitor.officeID, updatedVisitors);

            // Add this new visitor to newVisitors map for notification.
            if (!newVisitors.has(newVisitor.officeID)) {
                const newVisitorList: Visitor[] = [];
                newVisitors.set(newVisitor.officeID, newVisitorList);
            }
            const updatedNewVisitors = newVisitors
                .get(newVisitor.officeID)
                .concat(newVisitor);
            newVisitors.set(newVisitor.officeID, updatedNewVisitors);

            state = {
                ...state,
                visitors,
                newVisitors,
            };
            break;

        case CLEAR_NEW_VISITORS:
            const officeID = action.payload;
            let clearedNewVisitors = newVisitors.get(officeID);
            clearedNewVisitors = [];
            newVisitors.set(officeID, clearedNewVisitors);

            state = {
                ...state,
                newVisitors,
            };
            break;

        default:
            break;
    }
    return state;
};

export default dashboardReducers;
