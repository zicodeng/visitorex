import * as React from 'react';
import { connect } from 'react-redux';

import 'components/material-form/style';

export const FORM_TYPES = {
    ALT: 'material-form material-form__alt',
    BG_CARD: 'material-form material-form__bg-card',
    BASIC: 'material-form',
};

export interface FormError {
    message: string;
    type: string; // Form type this error belongs to.
}

export interface Input {
    // Needs to be valid HTML input type.
    type: string;
    ref?: string;
    // The field name for this input in returned form data object.
    // If not specified, ref will be used by default.
    field?: string;
    isRequired?: boolean;
    label: string;
    options?: string[];
    value?: string;
}

export interface Form {
    type: string;
    submitAction?: (formData) => void;
    title?: string;
    inputs?: Input[];
    btn?: string;
}

export const createBgForm = (): Form => {
    const bgForm: Form = {
        type: FORM_TYPES.BG_CARD,
    };
    return bgForm;
};

@connect(store => {
    return {
        materialForm: store.materialForm,
    };
})
class MaterialForm extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showDropdown: false,
            hasFormSubmitted: false,
            isAlt: false,
        };
    }

    public render(): JSX.Element {
        return (
            <div
                className={
                    this.state.isAlt
                        ? 'material-form-wrapper active'
                        : 'material-form-wrapper'
                }
            >
                {this.props.forms.map((form, i) => {
                    return this.renderForm(form, i);
                })}
            </div>
        );
    }

    public componentDidUpdate(): void {
        // If there is no error message and the form has been submitted
        // it implies that this form submission is successful,
        // clear the form.
        const errorMsg = this.props.materialForm.error.message;
        if (errorMsg && errorMsg.length === 0 && this.state.hasFormSubmitted) {
            this.clearForm();
        }
    }

    private renderForm = (form: Form, i: number): JSX.Element | null => {
        const type = form.type;
        if (!type) {
            return null;
        }
        if (type === FORM_TYPES.BG_CARD) {
            return <div key={i} className={type} />;
        }

        const submitAction = form.submitAction;
        const title = form.title;
        const inputs = form.inputs;
        const btn = form.btn;
        const inputTotal =
            type === FORM_TYPES.ALT && inputs ? inputs.length : 0;
        const errorMsg = this.props.materialForm.error.message;
        const errorType = this.props.materialForm.error.type;
        return (
            <form
                key={i}
                className={type}
                onSubmit={
                    submitAction
                        ? e => this.handleSubmitForm(e, submitAction)
                        : undefined
                }
            >
                {type === FORM_TYPES.ALT ? this.renderToggle() : null}
                {title ? this.renderTitle(type, title) : null}
                {inputs ? this.renderInputs(type, inputs) : null}
                {btn ? this.renderBtn(btn, inputTotal) : null}
                {errorMsg && errorType === form.type
                    ? this.renderError(errorMsg)
                    : null}
            </form>
        );
    };

    private renderToggle = (): JSX.Element => {
        return (
            <div
                className={this.state.isAlt ? 'toggle active' : 'toggle'}
                onClick={e => this.openAltForm()}
            />
        );
    };

    private openAltForm = (): void => {
        this.setState({
            isAlt: true,
        });
    };

    private closeAltForm = (): void => {
        this.setState({
            isAlt: false,
        });
    };

    private renderTitle = (type: string, title: string): JSX.Element => {
        return (
            <h1 className="title">
                {title}{' '}
                {type === FORM_TYPES.ALT ? (
                    <div className="close" onClick={e => this.closeAltForm()} />
                ) : null}
            </h1>
        );
    };

    private renderInputs = (
        formType: string,
        inputs: Input[],
    ): JSX.Element[] => {
        return inputs.map((input, i) => {
            const type = input.type;
            const ref = input.ref;
            const isRequired = input.isRequired;
            const label = input.label;
            const options = input.options;
            const value = input.value;

            if (type === 'link') {
                return (
                    <div
                        key={i}
                        className="input-container input-container__link"
                    >
                        <p className="link-label">{label}</p>
                        <a href={value} target="_blank">
                            {value}
                        </a>
                    </div>
                );
            }

            return (
                <div
                    key={i}
                    className={
                        options
                            ? 'input-container input-container__dropdown'
                            : 'input-container'
                    }
                    style={
                        this.state.isAlt && formType === FORM_TYPES.ALT
                            ? { transitionDelay: `${(i + 3) / 10.0}s` }
                            : undefined
                    }
                >
                    <input
                        className={value ? 'read-only' : undefined}
                        type={type}
                        ref={ref}
                        required={isRequired}
                        value={value ? value : undefined}
                        readOnly={value ? true : false}
                        onFocus={
                            options ? e => this.handleFocusInput() : undefined
                        }
                        onBlur={
                            options ? e => this.handleBlurInput() : undefined
                        }
                    />
                    <label>{label}</label>
                    <div className="bar" />
                    {ref && options && this.state.showDropdown
                        ? this.renderOptions(options, ref)
                        : null}
                </div>
            );
        });
    };

    private renderBtn = (btn: string, inputTotal: number): JSX.Element => {
        return (
            <div
                className="btn-container"
                style={
                    this.state.isAlt && inputTotal
                        ? { transitionDelay: `${(inputTotal + 3) / 10.0}s` }
                        : undefined
                }
            >
                <button>
                    <span>{btn}</span>
                </button>
            </div>
        );
    };

    private renderError = (error): JSX.Element => {
        return <p className="error">{error}</p>;
    };

    private handleFocusInput = (): void => {
        this.setState({
            showDropdown: true,
        });
    };

    private handleBlurInput = (): void => {
        // Delay firing onBlur event
        // so that our onClick event can be fired.
        setTimeout(() => {
            this.setState({
                showDropdown: false,
            });
        }, 150);
    };

    private renderOptions = (options: string[], ref: string): JSX.Element => {
        const li = options.map((option, i) => {
            return (
                <li key={i} onClick={e => this.handleClickOption(option, ref)}>
                    {option}
                </li>
            );
        });
        return <ul className="options">{li}</ul>;
    };

    private handleClickOption = (option: string, ref: string): void => {
        // Display selected option as value on this input element.
        this.refs[ref]['value'] = option;
    };

    private handleSubmitForm = (
        e: React.FormEvent<HTMLFormElement>,
        submitAction: (formData) => void,
    ): void => {
        e.preventDefault();

        const formData = {};
        const currentType = this.state.isAlt
            ? FORM_TYPES.ALT
            : FORM_TYPES.BASIC;
        this.props.forms.forEach((form: Form) => {
            if (form.inputs && form.type === currentType) {
                form.inputs.forEach((input: Input) => {
                    const ref = input.ref;
                    // The input could be a link that has no ref.
                    if (ref) {
                        const val = this.refs[ref]['value'];
                        const field = input.field ? input.field : ref;
                        formData[field] = val;
                    }
                });
            }
        });

        submitAction(formData);

        this.setState({
            hasFormSubmitted: true,
        });
    };

    private clearForm = (): void => {
        this.props.forms.forEach((form: Form) => {
            if (form.inputs) {
                form.inputs.forEach(input => {
                    if (input.ref) {
                        this.refs[input.ref]['value'] = '';
                    }
                });
            }
        });
    };
}

export default MaterialForm;
