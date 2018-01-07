import axios from 'axios';
import { Office } from 'dashboard/interfaces';

export const UPDATE_OFFICE_OPTION = 'UPDATE_OFFICE_OPTION';

export const updateOfficeOption = (office: Office) => {
    return dispatch =>
        dispatch({
            type: UPDATE_OFFICE_OPTION,
            payload: office,
        });
};
