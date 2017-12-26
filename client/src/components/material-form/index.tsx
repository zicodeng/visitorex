import * as React from 'react';

import 'components/material-form/style';

export const formTypes = {
    alt: 'material-form material-form__alt',
    bgCard: 'material-form material-form__bg-card',
    basic: 'material-form',
};

export interface Input {
    // Needs to be valid HTML input type.
    type: string;
    ref: string;
    // The name of field for this input in returned form data.
    // If not specified, ref will be used instead.
    field?: string;
    isRequired: boolean;
    label: string;
    options?: string[];
}

export interface Form {
    type?: string;
    // An action expects to return a boolean indicating
    // whether this submit action is successful or failed.
    submitAction?: (formData) => boolean;
    title?: string;
    inputs?: Input[];
    btn?: string;
}

export const createBgForm = (): Form => {
    const bgForm: Form = {
        type: formTypes.bgCard,
    };
    return bgForm;
};

interface MaterialFormProps {
    forms: Form[];
}

class MaterialForm extends React.Component<MaterialFormProps, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showDropdown: false,
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

    private renderForm = (form: Form, i: number): JSX.Element | null => {
        const type = form.type;
        if (!type) {
            return null;
        }
        if (type === formTypes.bgCard) {
            return <div key={i} className={type} />;
        }

        const submitAction = form.submitAction;
        const title = form.title;
        const inputs = form.inputs;
        const btn = form.btn;
        const inputTotal = type === formTypes.alt && inputs ? inputs.length : 0;
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
                {type === formTypes.alt ? this.renderToggle() : null}
                {title ? this.renderTitle(type, title) : null}
                {inputs ? this.renderInputs(type, inputs) : null}
                {btn ? this.renderBtn(btn, inputTotal) : null}
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
                {type === formTypes.alt ? (
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
            return (
                <div
                    key={i}
                    className={
                        options
                            ? 'input-container input-container__dropdown'
                            : 'input-container'
                    }
                    style={
                        this.state.isAlt && formType === formTypes.alt
                            ? { transitionDelay: `${(i + 3) / 10.0}s` }
                            : undefined
                    }
                >
                    <input
                        type={type}
                        ref={ref}
                        required={isRequired}
                        onFocus={
                            options ? e => this.handleFocusInput() : undefined
                        }
                        onBlur={
                            options ? e => this.handleBlurInput() : undefined
                        }
                    />
                    <label>{label}</label>
                    <div className="bar" />
                    {options && this.state.showDropdown
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
        }, 125);
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
        const currentType = this.state.isAlt ? formTypes.alt : formTypes.basic;
        this.props.forms.forEach(form => {
            if (form.inputs && form.type === currentType) {
                form.inputs.forEach(input => {
                    const ref = input.ref;
                    const val = this.refs[ref]['value'];
                    const field = input.field ? input.field : ref;
                    if (val) {
                        formData[field] = val;
                    }
                });
            }
        });

        if (submitAction(formData)) {
            this.clearForm();
        }
    };

    private clearForm = (): void => {
        this.props.forms.forEach(form => {
            if (form.inputs) {
                form.inputs.forEach(input => {
                    this.refs[input.ref]['value'] = '';
                });
            }
        });
    };
}

export default MaterialForm;
