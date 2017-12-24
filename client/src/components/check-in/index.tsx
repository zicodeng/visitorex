import * as React from 'react';

import { fetchOffices } from 'components/check-in/actions/office-actions';

import 'components/check-in/style';

class CheckIn extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showOfficeDropdown: false,
        };
    }

    public render() {
        return (
            <main>
                <div className="check-in-form ">
                    <div className="material-form material-form__background-card" />
                    <form className="material-form">
                        <h1 className="title">ExtraHop Visitor Check-In</h1>
                        <div
                            id="office-dropdown"
                            className="input-container input-container__dropdown"
                        >
                            <input
                                type="text"
                                ref="office"
                                onFocus={e => this.handleFocusInputOffice()}
                                onBlur={e => this.handleBlurInputOffice()}
                                required
                            />
                            <label htmlFor="office">Office</label>
                            <div className="bar" />
                            {this.renderOptions()}
                        </div>
                        <div className="input-container">
                            <input type="text" ref="firstName" required />
                            <label htmlFor="first-name">First Name</label>
                            <div className="bar" />
                        </div>
                        <div className="input-container">
                            <input type="text" ref="lastName" required />
                            <label htmlFor="last-name">Last Name</label>
                            <div className="bar" />
                        </div>
                        <div className="input-container">
                            <input type="text" ref="toSee" required />
                            <label htmlFor="to-see">To See</label>
                            <div className="bar" />
                        </div>
                        <div className="input-container">
                            <input type="text" ref="company" required />
                            <label htmlFor="company">Company</label>
                            <div className="bar" />
                        </div>
                        <div className="btn-container">
                            <button>
                                <span>Go</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        );
    }

    public componentWillMount() {
        fetchOffices();
    }

    private renderOptions = (): JSX.Element | null => {
        const offices = ['Global Headquarters (Seattle)', 'EMEA Headquarters'];
        const showOfficeDropdown = this.state.showOfficeDropdown;
        if (!showOfficeDropdown) {
            return null;
        }
        const li = offices.map((office, i) => {
            return (
                <li key={i} onClick={e => this.handleClickOption(offices, i)}>
                    {office}
                </li>
            );
        });

        return <ul className="options">{li}</ul>;
    };

    private handleClickOption = (offices, i): void => {
        // Display selected option on office input box.
        this.refs.office['value'] = offices[i];
    };

    private handleFocusInputOffice = (): void => {
        this.setState({
            showOfficeDropdown: true,
        });
    };

    private handleBlurInputOffice = (): void => {
        // Delay firing onBlur event
        // so that our onClick event can be fired.
        setTimeout(() => {
            this.setState({
                showOfficeDropdown: false,
            });
        }, 150);
    };
}

export default CheckIn;
