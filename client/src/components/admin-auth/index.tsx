import * as React from 'react';
import { connect } from 'react-redux';

import { signIn, signUp } from 'components/admin-auth/actions';
import MaterialForm, {
    FORM_TYPES,
    Input,
    Form,
    createBgForm,
} from 'components/material-form';

import 'components/admin-auth/style';

export interface NewAdmin {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConf: string;
}

export interface AdminCredentials {
    email: string;
    password: string;
}

@connect(store => {
    return {
        admin: store.admin,
    };
})
class AdminAuth extends React.Component<any, {}> {
    constructor(props, context) {
        super(props, context);
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
                field: 'email',
                isRequired: true,
                label: 'Email',
            },
            {
                type: 'password',
                ref: 'signinPassword',
                field: 'password',
                isRequired: true,
                label: 'Password',
            },
        ];

        const signinForm: Form = {
            type: FORM_TYPES.BASIC,
            submitAction: formData => this.submitSigninForm(formData),
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
                field: 'email',
                isRequired: true,
                label: 'Email',
            },
            {
                type: 'password',
                ref: 'signupPassword',
                field: 'password',
                isRequired: true,
                label: 'Password',
            },
            {
                type: 'password',
                ref: 'passwordConf',
                isRequired: true,
                label: 'Confirm Your Password',
            },
        ];

        const signupForm: Form = {
            type: FORM_TYPES.ALT,
            submitAction: formData => this.submitSignupForm(formData),
            title: 'NEW ADMIN',
            inputs: signupInputs,
            btn: 'SIGN UP',
        };

        return signupForm;
    };

    private submitSigninForm = formData => {
        this.props.dispatch(signIn(formData, FORM_TYPES.BASIC));
    };

    private submitSignupForm = formData => {
        this.props.dispatch(signUp(formData, FORM_TYPES.ALT));
    };
}

export default AdminAuth;
