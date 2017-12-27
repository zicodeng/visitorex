import { FormError } from 'components/material-form';

export const MATERIAL_FORM_SHOW_ERROR = 'MATERIAL_FORM_SHOW_ERROR';
export const MATERIAL_FORM_HIDE_ERROR = 'MATERIAL_FORM_HIDE_ERROR';

export const showError = (error: FormError) => {
    return {
        type: MATERIAL_FORM_SHOW_ERROR,
        payload: error,
    };
};

export const hideError = () => {
    return {
        type: MATERIAL_FORM_HIDE_ERROR,
        payload: '',
    };
};
