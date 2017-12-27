import axios, { AxiosPromise } from 'axios';
import { getCurrentHost, getSessionToken } from 'components/utils';

export const FETCH_VISITORS = 'FETCH_VISITORS';
export const FETCH_VISITORS_PENDING = 'FETCH_VISITORS_PENDING';
export const FETCH_VISITORS_FULFILLED = 'FETCH_VISITORS_FULFILLED';
export const FETCH_VISITORS_REJECTED = 'FETCH_VISITORS_REJECTED';

const fetchVisitors = (promises: AxiosPromise[]) => {
    return dispatch => {
        dispatch({
            type: FETCH_VISITORS,
            payload: axios.all(promises),
        }).catch(error => {
            console.log(error);
        });
    };
};

export const FETCH_OFFICES = 'FETCH_OFFICES';
export const FETCH_OFFICES_PENDING = 'FETCH_OFFICES_PENDING';
export const FETCH_OFFICES_FULFILLED = 'FETCH_OFFICES_FULFILLED';
export const FETCH_OFFICES_REJECTED = 'FETCH_OFFICES_REJECTED';

// Fetch a list of offices.
export const fetchOffices = () => {
    return dispatch =>
        dispatch({
            type: FETCH_OFFICES,
            payload: axios.get(`https://${getCurrentHost()}/v1/offices`, {
                headers: {
                    Authorization: getSessionToken(),
                },
            }),
        })
            .then(res => {
                const offices = res.value.data;
                const fetchVisitorsPromises: AxiosPromise[] = [];
                offices.forEach(office => {
                    const promise = axios.get(
                        `https://${getCurrentHost()}/v1/offices/${office.id}`,
                        {
                            headers: {
                                Authorization: getSessionToken(),
                            },
                        },
                    );
                    fetchVisitorsPromises.push(promise);
                });
                dispatch(fetchVisitors(fetchVisitorsPromises));
            })
            .catch(error => {
                console.log(error);
            });
};
