import { RENDER_SEARCH_RESULTS } from 'components/search/actions';

const initState = {
    results: [],
};

const searchReducers = (state = initState, action) => {
    switch (action.type) {
        case RENDER_SEARCH_RESULTS:
            let newResults = [];
            newResults = action.payload;

            state = {
                ...state,
                results: newResults,
            };
            break;

        default:
            break;
    }

    return state;
};

export default searchReducers;
