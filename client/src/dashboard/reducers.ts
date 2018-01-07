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
    officeMap: new Map(),
    visitorMap: new Map(),
    newVisitorMap: new Map(), // Used for sending notification.
};

const dashboardReducers = (state = initState, action) => {
    // Always create new maps by copying values from existing maps.
    const officeMap = new Map(state.officeMap);
    const visitorMap = new Map(state.visitorMap);
    const newVisitorMap = new Map(state.newVisitorMap);

    switch (action.type) {
        case FETCH_OFFICES_FULFILLED:
            const fetchedOffices = action.payload.data;
            fetchedOffices.forEach((office, i) => {
                // For React list key prop.
                office.key = i;
                officeMap.set(office.id, office);
            });

            state = {
                ...state,
                officeMap: officeMap,
            };
            break;

        case FETCH_VISITORS_FULFILLED:
            action.payload.forEach(item => {
                const fetchedVisitors = item.data;
                if (fetchedVisitors.length) {
                    const officeID = fetchedVisitors[0].officeID;
                    visitorMap.set(officeID, fetchedVisitors);
                }
            });

            state = {
                ...state,
                visitorMap: visitorMap,
            };
            break;

        case NEW_OFFICE_NOTIFICATION:
            const newOffice = action.payload;
            newOffice.key = officeMap.size;
            officeMap.set(newOffice.id, newOffice);

            state = {
                ...state,
                officeMap: officeMap,
            };
            break;

        // Triggered by websocket.
        case NEW_VISITOR_NOTIFICATION:
            const newVisitor = action.payload;

            // Add this new visitor to visitorMap map.
            if (!visitorMap.has(newVisitor.officeID)) {
                const visitors: Visitor[] = [];
                visitorMap.set(newVisitor.officeID, visitors);
            }
            const updatedVisitors = visitorMap
                .get(newVisitor.officeID)
                .concat(newVisitor);
            visitorMap.set(newVisitor.officeID, updatedVisitors);

            // Add this new visitor to newVisitorMap map for notification.
            if (!newVisitorMap.has(newVisitor.officeID)) {
                const newVisitors: Visitor[] = [];
                newVisitorMap.set(newVisitor.officeID, newVisitors);
            }
            const updatedNewVisitors = newVisitorMap
                .get(newVisitor.officeID)
                .concat(newVisitor);
            newVisitorMap.set(newVisitor.officeID, updatedNewVisitors);

            state = {
                ...state,
                visitorMap,
                newVisitorMap,
            };
            break;

        case CLEAR_NEW_VISITORS:
            const officeID = action.payload;
            let emptyNewVisitors = newVisitorMap.get(officeID);
            emptyNewVisitors = [];
            newVisitorMap.set(officeID, emptyNewVisitors);

            state = {
                ...state,
                newVisitorMap,
            };
            break;

        default:
            break;
    }
    return state;
};

export default dashboardReducers;
