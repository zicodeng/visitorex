import axios from 'axios';

export const RENDER_SEARCH_RESULTS = 'RENDER_SEARCH_RESULTS';

export const renderSearchResults = (results: any[]) => {
    return dispatch => {
        dispatch({
            type: RENDER_SEARCH_RESULTS,
            payload: results,
        });
    };
};
