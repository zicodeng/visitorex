import * as React from 'react';
import { connect } from 'react-redux';

import { fetchAdmin } from 'admin-auth/actions';
import { FormError } from 'components/material-form';
import { showError } from 'components/material-form/actions';
import { newVisitor } from 'dashboard/actions';
import MaterialForm, {
    FORM_TYPES,
    Input,
    Form,
    createBgForm,
} from 'components/material-form';

import 'check-in/style';

@connect(store => {
    return {
        offices: store.dashboard.offices,
        officeOption: store.checkin.officeOption,
    };
})
class CheckIn extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showOfficeDropdown: false,
        };
    }

    public render() {
        return <main className="check-in">{this.renderCheckinForm()}</main>;
    }

    public componentWillMount() {
        // For the purpose of authenticating admin
        // and preventing non-admin from jumping to this page directly.
        this.props.dispatch(fetchAdmin());
        if (!this.props.officeOption || !this.props.officeOption) {
            this.props.history.replace('/dashboard/overview');
        }
    }

    private renderCheckinForm = () => {
        const forms: Form[] = [createBgForm(), this.createCheckinForm()];
        return (
            <div className="visitor-checkin-form">
                <MaterialForm forms={forms} />
            </div>
        );
    };

    private createCheckinForm = () => {
        const checkinInputs: Input[] = [
            {
                type: 'text',
                ref: 'office',
                isRequired: true,
                label: 'Office',
                value: this.props.officeOption,
            },
            {
                type: 'text',
                ref: 'firstName',
                isRequired: true,
                label: 'First Name',
            },
            {
                type: 'text',
                ref: 'lastName',
                isRequired: true,
                label: 'Last Name',
            },
            {
                type: 'text',
                ref: 'toSee',
                isRequired: true,
                label: 'To See',
            },
            {
                type: 'text',
                ref: 'company',
                isRequired: true,
                label: 'Company',
            },
        ];

        const checkinForm: Form = {
            type: FORM_TYPES.BASIC,
            submitAction: formData => this.submitCheckinForm(formData),
            title: 'EXTRAHOP VISITOR',
            inputs: checkinInputs,
            btn: 'CHECK IN',
        };

        return checkinForm;
    };

    private submitCheckinForm = formData => {
        const dispatch = this.props.dispatch;

        const officeID = this.getSelectedOfficeID(formData.office);
        // Report error if no such office found.
        if (!officeID) {
            const formError: FormError = {
                message: 'No such office found',
                type: FORM_TYPES.BASIC,
            };
            dispatch(showError(formError));
            return;
        }

        dispatch(newVisitor(formData, officeID, FORM_TYPES.BASIC));
    };

    private getSelectedOfficeID = (officeName: string): string => {
        for (let office of this.props.offices) {
            if (office.name === officeName) {
                return office.id;
            }
        }
        return '';
    };
}

export default CheckIn;
