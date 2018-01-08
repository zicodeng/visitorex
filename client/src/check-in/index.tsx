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
import Footer from 'components/footer';

import 'check-in/style';

@connect(store => {
    return {
        admin: store.admin.user,
        office: store.checkin.office,
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
        return (
            <main className="check-in">
                {this.renderCheckinForm()} <Footer />
            </main>
        );
    }

    public componentWillMount() {
        // For the purpose of authenticating admin
        // and preventing non-admin from jumping to this page directly.
        if (!this.props.admin) {
            this.props.dispatch(fetchAdmin());
        }

        if (!this.props.office) {
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
        const office = this.props.office;
        const checkinInputs: Input[] = [
            {
                type: 'text',
                ref: 'office',
                isRequired: true,
                label: 'Office',
                value: office.name,
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
        const { dispatch, office } = this.props;

        dispatch(
            newVisitor(
                formData,
                office.id,
                FORM_TYPES.BASIC,
                this.props.history,
                this.props.admin.sessionToken,
            ),
        );
    };
}

export default CheckIn;
