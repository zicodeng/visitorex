import * as materialFormActions from 'components/material-form/actions';

const initState = {
    error: '',
};

const materialFormReducers = (state = initState, action) => {
    switch (action.type) {
        case materialFormActions.MATERIAL_FORM_SHOW_ERROR:
            state = {
                ...state,
                error: action.payload,
            };
            break;

        case materialFormActions.MATERIAL_FORM_HIDE_ERROR:
            state = {
                ...state,
                error: action.payload,
            };
            break;

        default:
            break;
    }
    return state;
};

export default materialFormReducers;
