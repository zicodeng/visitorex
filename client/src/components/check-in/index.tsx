import * as React from 'react';

import { fetchOffices } from 'components/check-in/actions/office-actions';
import MaterialForm, {
    formTypes,
    Input,
    InputRefVal,
    Form,
    createBgForm,
} from 'components/material-form';

import 'components/check-in/style';

class CheckIn extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showOfficeDropdown: false,
        };
    }

    public render() {
        return <main>{this.renderCheckinForm()}</main>;
    }

    public componentWillMount() {
        fetchOffices();
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
        const offices = ['Global Headquarters (Seattle)', 'EMEA Headquarters'];
        const checkinInputs: Input[] = [
            {
                type: 'text',
                ref: 'office',
                isRequired: true,
                label: 'Office',
                options: offices,
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
            type: formTypes.basic,
            submitAction: inputRefVals => this.submitCheckinForm(inputRefVals),
            title: 'EXTRAHOP VISITOR',
            inputs: checkinInputs,
            btn: 'CHECK IN',
        };

        return checkinForm;
    };

    private submitCheckinForm = (inputRefVals: InputRefVal[]): boolean => {
        console.log('Check-in submit');
        console.log(inputRefVals);
        return false;
    };
}

export default CheckIn;
