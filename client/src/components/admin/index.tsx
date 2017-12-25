import * as React from 'react';

import MaterialForm, {
    formTypes,
    Input,
    InputRefVal,
    Form,
    createBgForm,
} from 'components/material-form';

import 'components/admin/style';

class Admin extends React.Component<{}, {}> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isSignup: false,
            signinError: '',
            signupError: '',
        };
    }

    public render() {
        return <main>{this.renderAdminAuthForm()}</main>;
    }

    private renderAdminAuthForm = () => {
        const forms: Form[] = [
            createBgForm(),
            this.createSigninForm(),
            this.createSignupForm(),
        ];
        return (
            <div className="admin-auth-form">
                <MaterialForm forms={forms} />
            </div>
        );
    };

    private createSigninForm = (): Form => {
        const signinInputs: Input[] = [
            {
                type: 'email',
                ref: 'signinEmail',
                isRequired: true,
                label: 'Email',
            },
            {
                type: 'password',
                ref: 'signinPassword',
                isRequired: true,
                label: 'Password',
            },
        ];

        const signinForm: Form = {
            type: formTypes.basic,
            submitAction: inputRefVals => this.submitSigninForm(inputRefVals),
            title: 'EXTRAHOP ADMIN',
            inputs: signinInputs,
            btn: 'SIGN IN',
        };

        return signinForm;
    };

    private createSignupForm = (): Form => {
        const signupInputs: Input[] = [
            {
                type: 'text',
                ref: 'userName',
                isRequired: true,
                label: 'User Name',
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
                type: 'email',
                ref: 'signupEmail',
                isRequired: true,
                label: 'Email',
            },
            {
                type: 'password',
                ref: 'signupPassword',
                isRequired: true,
                label: 'Password',
            },
            {
                type: 'password',
                ref: 'signupPasswordConf',
                isRequired: true,
                label: 'Confirm Your Password',
            },
        ];

        const signupForm: Form = {
            type: formTypes.alt,
            submitAction: inputRefVals => this.submitSignupForm(inputRefVals),
            title: 'NEW ADMIN',
            inputs: signupInputs,
            btn: 'SIGN UP',
        };

        return signupForm;
    };

    private submitSigninForm = (inputRefVals: InputRefVal[]): boolean => {
        console.log('submit sign in');
        console.log(inputRefVals);
        return true;
    };

    private submitSignupForm = (inputRefVals: InputRefVal[]): boolean => {
        console.log('submit sign up');
        console.log(inputRefVals);
        return true;
    };
}

export default Admin;
