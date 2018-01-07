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
import { signOut } from 'admin-auth/actions';

const MENU_OPTION_OVERVIEW = 'Overview';
const MENU_OPTION_OFFICES = 'Offices';
const MENU_OPTION_SIGN_OUT = 'Sign Out';

const MENU_PATH_OVERVIEW = convertToURLFormat(MENU_OPTION_OVERVIEW);
const MENU_PATH_OFFICES = convertToURLFormat(MENU_OPTION_OFFICES);
const MENU_PATH_SIGN_OUT = convertToURLFormat(MENU_OPTION_SIGN_OUT);

// Expected resource path: /dashboard/<menu-path>/<office-path>
export const DASHBOARD_PATH_INDEX = 1;
export const MENU_PATH_INDEX = 2;
export const OFFICE_PATH_INDEX = 3;

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
            // Default to Overview menu option.
            activeMenuOption: MENU_PATH_OVERVIEW,

            // Represents an office ID.
            activeOfficeOption: '',

            isNewOfficeFormSubmitted: false,
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
                                id={MENU_PATH_OVERVIEW}
                                className={
                                    this.state.activeMenuOption ===
                                    MENU_PATH_OVERVIEW
                                        ? 'menu-option-content active'
                                        : 'menu-option-content'
                                }
                                to={`/dashboard/${MENU_PATH_OVERVIEW}`}
                                onClick={e => this.handleClickMenuOption(e)}
                            >
                                {MENU_OPTION_OVERVIEW}
                            </Link>
                        </li>
                        <li className="menu-option">
                            <a
                                id={MENU_PATH_OFFICES}
                                className={
                                    this.state.activeMenuOption ===
                                    MENU_PATH_OFFICES
                                        ? 'menu-option-content arrow active'
                                        : 'menu-option-content arrow'
                                }
                                onClick={e => this.handleClickMenuOption(e)}
                            >
                                {MENU_OPTION_OFFICES}
                            </a>
                            {this.state.activeMenuOption === MENU_PATH_OFFICES
                                ? this.renderOfficeOptions()
                                : null}
                        </li>
                        <li className="menu-option">
                            <a
                                id={MENU_PATH_SIGN_OUT}
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

    public componentWillReceiveProps(prevProp, nextProp): void {
        this.syncSidebarToResourcePath();
        this.redirectInvalidOfficePath();
    }

    // As the current resource path (window.location.pathname) changes,
    // sync active menu option and office option.
    private syncSidebarToResourcePath = (): void => {
        const resourcePath = window.location.pathname.split('/');
        const menuPath = resourcePath[MENU_PATH_INDEX];

        // If we are on "Offices" menu, accessing a specific office resource...
        if (menuPath === MENU_PATH_OFFICES) {
            // Office path represents an office ID.
            const officePath = resourcePath[OFFICE_PATH_INDEX];
            this.setState({
                activeOfficeOption: officePath,
                activeMenuOption: menuPath,
            });
            return;
        }

        // If not on "Offices" menu...
        this.setState({
            activeOfficeOption: '',
            activeMenuOption: menuPath,
        });
    };

    // Enforce current resource path is valid.
    private redirectInvalidOfficePath = (): void => {
        const resourcePath = window.location.pathname.split('/');
        const dashboardPath = resourcePath[DASHBOARD_PATH_INDEX];
        const menuPath = resourcePath[MENU_PATH_INDEX];
        const officePath = resourcePath[OFFICE_PATH_INDEX];

        const offices = this.props.dashboard.offices;
        const firstOfficeId = offices.keys().next().value;

        // If set to true, disable redirectInvalidOfficePath(). Let normal redirect take place.
        const isNewOfficeFormSubmitted = this.state.isNewOfficeFormSubmitted;
        if (isNewOfficeFormSubmitted) {
            return;
        }

        // If there is no matching office in resource path,
        // (possibly the user types a bad URL)
        // Redirect the user to the first office found in the list.
        if (
            !isNewOfficeFormSubmitted &&
            !offices.has(officePath) &&
            dashboardPath === 'dashboard' &&
            menuPath === MENU_PATH_OFFICES &&
            firstOfficeId
        ) {
            const redirectLocation = `/dashboard/offices/${firstOfficeId}`;
            this.props.history.replace(redirectLocation);
        }
    };

    private handleClickMenuOption = (e): void => {
        const clickedMenuOption = e.target.id;
        this.setState({
            activeMenuOption: clickedMenuOption,
            isNewOfficeFormSubmitted: false,
        });

        // If not on "Offices" menu option, no office option should be marked as active.
        if (clickedMenuOption !== MENU_PATH_OFFICES) {
            this.setState({
                activeOfficeOption: '',
            });
        }

        // If "Sign Out" menu option is clicked...
        if (clickedMenuOption === MENU_PATH_SIGN_OUT) {
            this.props.dispatch(signOut());
        }
    };

    private renderOfficeOptions = (): JSX.Element => {
        const offices = this.props.dashboard.offices;
        const officeOptions: JSX.Element[] = [];

        for (let office of offices.values()) {
            let officeOptionClasses = 'office-option-content';

            // Mark active office option with a active class.
            if (this.state.activeOfficeOption === office.id) {
                officeOptionClasses += ' active';
            }

            officeOptions.push(
                <li key={office.key} className="office-option">
                    <a
                        className={officeOptionClasses}
                        data-office-id={office.id}
                    >
                        {office.name}
                    </a>
                </li>,
            );
        }

        // Render "New Office" option.
        let newOfficeClasses = 'office-option-content new-office';
        if (this.props.modal.show) {
            newOfficeClasses += ' active';
        }
        const newOffice = (
            <li key={officeOptions.length + 1} className="office-option">
                <a id="new-office" className={newOfficeClasses}>
                    New Office
                </a>
            </li>
        );
        officeOptions.push(newOffice);

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
        this.setState({
            isNewOfficeFormSubmitted: false,
        });

        // If "New Office" option is clicked...
        if (e.target.id === 'new-office') {
            this.handleClickNewOffice();
            return;
        }

        const activeOfficeOption = e.target.dataset.officeId;
        this.setState({
            activeMenuOption: activeOfficeOption,
        });

        // Render a new dashboard for this office by pushing a new location to history,
        // which will cause window.location.pathname to change.
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
        this.setState({
            isNewOfficeFormSubmitted: true,
        });
    };
}

export default Sidebar;
