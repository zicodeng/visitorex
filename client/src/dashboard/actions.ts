import axios, { AxiosPromise } from 'axios';

import { getCurrentHost, getSessionToken } from 'utils';
import { fetchAdmin, updateAdmin } from 'admin-auth/actions';
import { Office, Visitor } from 'dashboard/interfaces';
import { FormError } from 'components/material-form';
import { hideError, showError } from 'components/material-form/actions';
import { openModal, closeModal } from 'components/modal/actions';
import { convertToURLFormat } from 'dashboard/sidebar/utils';
import { renderSearchResults } from 'components/search/actions';

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
        });
};

export const FETCH_VISITORS = 'FETCH_VISITORS';
export const FETCH_VISITORS_PENDING = 'FETCH_VISITORS_PENDING';
export const FETCH_VISITORS_FULFILLED = 'FETCH_VISITORS_FULFILLED';
export const FETCH_VISITORS_REJECTED = 'FETCH_VISITORS_REJECTED';

// Fetch all visitors for each office.
const fetchVisitors = (promises: AxiosPromise[]) => {
    return dispatch => {
        dispatch({
            type: FETCH_VISITORS,
            payload: axios.all(promises),
        });
    };
};

export const fetchDashboard = () => {
    return dispatch => {
        dispatch(fetchAdmin())
            .then(() => {
                return dispatch(fetchOffices());
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
};

export const NEW_OFFICE = 'NEW_OFFICE';
export const NEW_OFFICE_PENDING = 'NEW_OFFICE_PENDING';
export const NEW_OFFICE_FULFILLED = 'NEW_OFFICE_FULFILLED';
export const NEW_OFFICE_REJECTED = 'NEW_OFFICE_REJECTED';
export const NEW_OFFICE_NOTIFICATION = 'NEW_OFFICE_NOTIFICATION';

export const newOffice = (newOffice: Office, formType: string, history) => {
    return dispatch => {
        dispatch({
            type: NEW_OFFICE,
            payload: axios.post(
                `https://${getCurrentHost()}/v1/offices`,
                newOffice,
                {
                    headers: {
                        Authorization: getSessionToken(),
                    },
                },
            ),
        })
            .then(() => {
                // Close Modal and hide error if this API request is successful.
                dispatch(closeModal());
                dispatch(hideError());

                const redirectLocation = `/dashboard/offices/${convertToURLFormat(
                    newOffice.name,
                )}`;
                history.push(redirectLocation);
            })
            .catch(error => {
                const formError: FormError = {
                    message: error.response.data,
                    type: formType,
                };
                dispatch(showError(formError));
            });
    };
};

export const NEW_VISITOR = 'NEW_VISITOR';
export const NEW_VISITOR_PENDING = 'NEW_VISITOR_PENDING';
export const NEW_VISITOR_FULFILLED = 'NEW_VISITOR_FULFILLED';
export const NEW_VISITOR_REJECTED = 'NEW_VISITOR_REJECTED';
export const NEW_VISITOR_NOTIFICATION = 'NEW_VISITOR_NOTIFICATION';

export const newVisitor = (
    newVisitor: Visitor,
    officeID: string,
    formType: string,
    history,
    sessionToken: string,
) => {
    return dispatch => {
        dispatch({
            type: NEW_VISITOR,
            payload: axios.post(
                `https://${getCurrentHost()}/v1/offices/${officeID}`,
                newVisitor,
                {
                    headers: {
                        Authorization: sessionToken,
                    },
                },
            ),
        })
            .then(() => {
                dispatch(hideError());
                history.push('/thank-you');
            })
            .catch(error => {
                const formError: FormError = {
                    message: error.response.data,
                    type: formType,
                };
                dispatch(showError(formError));
            });
    };
};

export const CLEAR_NEW_VISITORS = 'CLEAR_NEW_VISITORS';

export const clearNewVisitors = (officeID: string) => {
    return dispatch => {
        dispatch({
            type: CLEAR_NEW_VISITORS,
            payload: officeID,
        });
    };
};

export const SEARCH_VISITORS = 'SEARCH_VISITORS';
export const SEARCH_VISITORS_PENDING = 'SEARCH_VISITORS_PENDING';
export const SEARCH_VISITORS_FULFILLED = 'SEARCH_VISITORS_FULFILLED';
export const SEARCH_VISITORS_REJECTED = 'SEARCH_VISITORS_REJECTED';

// Search visitors by query in a given office.
export const searchVisitors = (officeID: string, query: string) => {
    const searchURL = `https://${getCurrentHost()}/v1/offices/${officeID}/search?q=${query}`;
    return dispatch => {
        dispatch({
            type: SEARCH_VISITORS,
            payload: axios.get(searchURL, {
                headers: {
                    Authorization: getSessionToken(),
                },
            }),
        })
            .then(res => {
                const visitors = res.value.data;
                dispatch(renderSearchResults(visitors));
            })
            .catch(error => {
                console.log(error);
            });
    };
};

export const SEARCH_ALL_VISITORS = 'SEARCH_ALL_VISITORS';
export const SEARCH_ALL_VISITORS_PENDING = 'SEARCH_ALL_VISITORS_PENDING';
export const SEARCH_ALL_VISITORS_FULFILLED = 'SEARCH_ALL_VISITORS_FULFILLED';
export const SEARCH_ALL_VISITORS_REJECTED = 'SEARCH_ALL_VISITORS_REJECTED';

export const searchAllVisitors = (officeID: string) => {
    return dispatch => {
        dispatch({
            type: SEARCH_ALL_VISITORS,
            payload: axios.get(
                `https://${getCurrentHost()}/v1/offices/${officeID}`,
                {
                    headers: {
                        Authorization: getSessionToken(),
                    },
                },
            ),
        })
            .then(res => {
                const visitors = res.value.data;
                dispatch(renderSearchResults(visitors));
            })
            .catch(error => {
                console.log(error);
            });
    };
};

export const SEARCH_VISITORS_BETWEEN_TWO_DATES =
    'SEARCH_VISITORS_BETWEEN_TWO_DATES';
export const SEARCH_VISITORS_BETWEEN_TWO_DATES_PENDING =
    'SEARCH_VISITORS_BETWEEN_TWO_DATESPEN_PENDING';
export const SEARCH_VISITORS_BETWEEN_TWO_DATES_FULFILLED =
    'SEARCH_VISITORS_BETWEEN_TWO_DATES_FULFILLED';
export const SEARCH_VISITORS_BETWEEN_TWO_DATES_REJECTED =
    'SEARCH_VISITORS_BETWEEN_TWO_DATES_REJECTED';

export const searchVisitorsBetweenTwoDates = (
    officeID: string,
    startDate: string,
    endDate: string,
) => {
    const searchURL = `https://${getCurrentHost()}/v1/offices/${officeID}/search?startDate=${startDate}&endDate=${endDate}`;
    return dispatch => {
        dispatch({
            type: SEARCH_VISITORS,
            payload: axios.get(searchURL, {
                headers: {
                    Authorization: getSessionToken(),
                },
            }),
        })
            .then(res => {
                const visitors = res.value.data;
                dispatch(renderSearchResults(visitors));
            })
            .catch(error => {
                console.log(error);
            });
    };
};
