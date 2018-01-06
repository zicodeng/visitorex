import axios from 'axios';

export const UPDATE_OFFICE_OPTION = 'UPDATE_OFFICE_OPTION';

export const updateOfficeOption = (office: string) => {
    return dispatch =>
        dispatch({
            type: UPDATE_OFFICE_OPTION,
            payload: office,
        });
};
