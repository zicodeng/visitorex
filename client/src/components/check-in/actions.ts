import axios from 'axios';
import { getCurrentHost, getSessionToken } from 'components/utils';

export const officeTypes = {
    fetchOffices: 'FETCH_OFFICES',
};

// Fetch a list of offices.
export const fetchOffices = () => {
    return {
        type: officeTypes.fetchOffices,
        payload: axios.get(`https://${getCurrentHost()}/v1/offices`, {
            headers: {
                // Authorization: getSessionToken(),
            },
        }),
    };
};
