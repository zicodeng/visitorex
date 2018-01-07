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
    officeMap: new Map<string, Office>(),
    visitorMap: new Map<string, Visitor[]>(),
    newVisitorMap: new Map<string, Visitor[]>(), // Used for sending notification.
    officeNameToIDMap: new Map<string, string>(), // Used for mapping office path to office ID.
};

const dashboardReducers = (state = initState, action) => {
    // Always create new maps by copying values from existing maps.
    const officeMap = new Map(state.officeMap);
    const visitorMap = new Map(state.visitorMap);
    const newVisitorMap = new Map(state.newVisitorMap);
    const officeNameToIDMap = new Map(state.officeNameToIDMap);

    switch (action.type) {
        case FETCH_OFFICES_FULFILLED:
            const fetchedOffices = action.payload.data;
            fetchedOffices.forEach((office, i) => {
                // For React list key prop.
                office.key = i;
                officeMap.set(office.id, office);
                officeNameToIDMap.set(
                    convertToURLFormat(office.name),
                    office.id,
                );
            });

            state = {
                ...state,
                officeMap: officeMap,
                officeNameToIDMap: officeNameToIDMap,
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
            officeNameToIDMap.set(
                convertToURLFormat(newOffice.name),
                newOffice.id,
            );

            state = {
                ...state,
                officeMap: officeMap,
                officeNameToIDMap: officeNameToIDMap,
            };
            break;

        // Triggered by websocket.
        case NEW_VISITOR_NOTIFICATION:
            const newVisitor = action.payload;
            if (!newVisitor) {
                return;
            }

            // Add this new visitor to visitorMap map.
            let visitors = visitorMap.get(newVisitor.officeID);
            if (!visitors) {
                visitors = [];
                visitorMap.set(newVisitor.officeID, visitors);
            }
            const updatedVisitors = visitors.concat(newVisitor);
            visitorMap.set(newVisitor.officeID, updatedVisitors);

            // Add this new visitor to newVisitorMap map for notification.
            let newVisitors = newVisitorMap.get(newVisitor.officeID);
            if (!newVisitors) {
                newVisitors = [];
                newVisitorMap.set(newVisitor.officeID, newVisitors);
            }
            const updatedNewVisitors = newVisitors.concat(newVisitor);
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
