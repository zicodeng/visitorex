import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Modal from 'components/modal';
import { openModal } from 'components/modal/actions';
import { convertToURLFormat } from 'dashboard/sidebar/utils';
import MaterialForm, {
    Form,
    FORM_TYPES,
    Input,
} from 'components/material-form';
import { newOffice } from 'dashboard/actions';

import 'dashboard/sidebar/style';

const MENU_OPTION_OVERVIEW = 'Overview';
const MENU_OPTION_OFFICES = 'Offices';
const MENU_OPTION_SIGN_OUT = 'Sign Out';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
        modal: store.modal,
    };
})
class Sidebar extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            activeMenuOption: convertToURLFormat(MENU_OPTION_OVERVIEW), // Default to Overview menu option.
            activeOfficeOption: '',
        };
    }

    public render(): JSX.Element {
        const admin = this.props.admin.user;
        return (
            <aside className="sidebar">
                <div className="new-office-modal">
                    <Modal content={this.newOfficeForm()} />
                </div>
                <h1 className="logo">
                    VISITOR<span>EX</span>
                </h1>
                <div className="admin-profile">
                    <div
                        className="photo"
                        style={{ backgroundImage: `url(${admin.photoURL})` }}
                    />
                    <h2 className="name">
                        {admin.firstName} {admin.lastName}
                    </h2>
                    <p className="email">{admin.email}</p>
                </div>
                <div className="menu">
                    <ul className="menu-options">
                        <li className="menu-option">
                            <Link
                                className={
                                    this.state.activeMenuOption ===
                                    convertToURLFormat(MENU_OPTION_OVERVIEW)
                                        ? 'menu-option-content active'
                                        : 'menu-option-content'
                                }
                                to={`/dashboard/${convertToURLFormat(
                                    MENU_OPTION_OVERVIEW,
                                )}`}
                                onClick={e => this.handleClickMenuOption(e)}
                            >
                                {MENU_OPTION_OVERVIEW}
                            </Link>
                        </li>
                        <li className="menu-option">
                            <a
                                className={
                                    this.state.activeMenuOption ===
                                    convertToURLFormat(MENU_OPTION_OFFICES)
                                        ? 'menu-option-content arrow active'
                                        : 'menu-option-content arrow'
                                }
                                onClick={e => this.handleClickMenuOption(e)}
                            >
                                {MENU_OPTION_OFFICES}
                            </a>
                            {this.state.activeMenuOption ===
                            convertToURLFormat(MENU_OPTION_OFFICES)
                                ? this.renderOfficeOptions()
                                : null}
                        </li>
                        <li className="menu-option">
                            <a
                                className="menu-option-content sign-out"
                                onClick={e => this.handleClickMenuOption(e)}
                            >
                                {MENU_OPTION_SIGN_OUT}
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    }

    public componentWillReceiveProps(prevProp, nextProp) {
        this.syncSidebarOptionsToCurrentLocation();
    }

    // As the window location pathname changes, sync active menu option and office option.
    private syncSidebarOptionsToCurrentLocation = (): void => {
        const resourcePath = window.location.pathname.split('/');
        const menuPath = resourcePath[2];

        if (menuPath === convertToURLFormat(MENU_OPTION_OFFICES)) {
            const currentOffice = resourcePath[3];
            this.setState({
                activeOfficeOption: currentOffice,
                activeMenuOption: menuPath,
            });
            return;
        }

        this.setState({
            activeOfficeOption: '',
            activeMenuOption: menuPath,
        });
    };

    private handleClickMenuOption = (e): void => {
        const option = e.target.innerText;

        this.setState({
            activeMenuOption: convertToURLFormat(option),
        });

        if (option !== MENU_OPTION_OFFICES) {
            this.setState({
                activeOfficeOption: '',
            });
        }
    };

    private renderOfficeOptions = (): JSX.Element => {
        const offices = this.props.dashboard.offices;
        let hasMatchingOffice = false;
        const currentOffice = window.location.pathname.split('/')[3];

        const officeOptions = offices.map((office, i) => {
            // Make sure current office in resource path has a matching office in offices list.
            if (currentOffice === convertToURLFormat(office.name)) {
                hasMatchingOffice = true;
            }

            let officeOptionClasses = 'office-option-content';
            if (
                this.state.activeOfficeOption ===
                convertToURLFormat(office.name)
            ) {
                officeOptionClasses += ' active';
            }

            const location = `/dashboard/offices/${convertToURLFormat(
                office.name,
            )}`;

            return (
                <li key={i} className="office-option">
                    <a className={officeOptionClasses}>{office.name}</a>
                </li>
            );
        });

        let newOfficeClasses = 'office-option-content new-office';
        if (this.props.modal.show) {
            newOfficeClasses += ' active';
        }
        const newOffice = (
            <li key={officeOptions.length} className="office-option">
                <a id="new-office" className={newOfficeClasses}>
                    New Office
                </a>
            </li>
        );

        officeOptions.push(newOffice);

        // If there is no matching office in resource path,
        // (possibly the user types a bad URL)
        // Redirect the user to the first office found in the list.
        if (
            !hasMatchingOffice &&
            window.location.pathname.split('/').length > 3 &&
            offices[0]
        ) {
            const redirectLocation = `/dashboard/offices/${convertToURLFormat(
                offices[0].name,
            )}`;
            window.location.replace(redirectLocation);
        }

        return (
            <ul
                className="office-options"
                onClick={e => this.handleClickOfficeOption(e)}
            >
                {officeOptions}
            </ul>
        );
    };

    private handleClickOfficeOption = (e): void => {
        const activeOfficeOption = convertToURLFormat(e.target.innerText);

        // If "New Office" option is clicked...
        if (e.target.id === 'new-office') {
            this.handleClickNewOffice();
            return;
        }

        // Render a new dashboard for this office by pushing a new location to history,
        // which will cause window.location.pathname to change.
        this.setState({
            activeOfficeOption: activeOfficeOption,
        });
        const location = `/dashboard/offices/${activeOfficeOption}`;
        this.props.history.push(location);
    };

    private handleClickNewOffice = (): void => {
        this.props.dispatch(openModal());
    };

    private newOfficeForm = (): JSX.Element => {
        const newOfficeInputs: Input[] = [
            {
                type: 'text',
                ref: 'name',
                isRequired: true,
                label: 'Name',
            },
            {
                type: 'text',
                ref: 'addr',
                isRequired: true,
                label: 'Address',
            },
        ];

        const newOfficeForm: Form = {
            type: FORM_TYPES.BASIC,
            submitAction: formData => this.submitNewOfficeForm(formData),
            title: 'NEW OFFICE',
            inputs: newOfficeInputs,
            btn: 'CREATE',
        };

        const forms: Form[] = [newOfficeForm];

        return (
            <div className="new-office-form">
                <MaterialForm forms={forms} />
            </div>
        );
    };

    private submitNewOfficeForm = formData => {
        this.props.dispatch(
            newOffice(formData, FORM_TYPES.BASIC, this.props.history),
        );
    };
}

export default Sidebar;
