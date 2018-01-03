import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { convertToURLFormat } from 'components/dashboard/sidebar/utils';

import 'components/dashboard/sidebar/style';

const MENU_OPTION_OVERVIEW = 'Overview';
const MENU_OPTION_OFFICES = 'Offices';
const MENU_OPTION_SIGN_OUT = 'Sign Out';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class Sidebar extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isOfficesClicked: false,
        };
    }

    public render(): JSX.Element {
        const admin = this.props.admin.user;
        const resourcePath = window.location.pathname.split('/')[2];
        return (
            <aside className="sidebar">
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
                    <ul
                        className="menu-options"
                        onClick={e => this.handleClickMenuOption(e)}
                    >
                        <li className="menu-option">
                            <Link
                                className={
                                    resourcePath ===
                                    convertToURLFormat(MENU_OPTION_OVERVIEW)
                                        ? 'menu-option-content active'
                                        : 'menu-option-content'
                                }
                                to={`/dashboard/${convertToURLFormat(
                                    MENU_OPTION_OVERVIEW,
                                )}`}
                            >
                                {MENU_OPTION_OVERVIEW}
                            </Link>
                        </li>
                        <li className="menu-option">
                            <a
                                className={
                                    resourcePath ===
                                    convertToURLFormat(MENU_OPTION_OFFICES)
                                        ? 'menu-option-content arrow active'
                                        : 'menu-option-content arrow'
                                }
                            >
                                {MENU_OPTION_OFFICES}
                            </a>
                            {this.state.isOfficesClicked
                                ? this.renderOfficeOptions()
                                : null}
                        </li>
                        <li className="menu-option">
                            <a className="menu-option-content sign-out">
                                {MENU_OPTION_SIGN_OUT}
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    }

    public componentWillMount() {
        const resourcePath = window.location.pathname.split('/')[2];
        if (resourcePath === convertToURLFormat(MENU_OPTION_OFFICES)) {
            this.setState({
                isOfficesClicked: true,
            });
        }
    }

    private handleClickMenuOption = (e): void => {
        const menuOptions = document.getElementsByClassName(
            'menu-option-content',
        );
        const option = e.target.innerText;

        switch (option) {
            case MENU_OPTION_OVERVIEW:
                Array.from(menuOptions).forEach(option => {
                    option.classList.remove('active');
                });
                this.setState({
                    isOfficesClicked: false,
                });
                break;

            case MENU_OPTION_OFFICES:
                Array.from(menuOptions).forEach(option => {
                    option.classList.remove('active');
                });
                this.setState({
                    isOfficesClicked: true,
                });
                break;

            case MENU_OPTION_SIGN_OUT:
                Array.from(menuOptions).forEach(option => {
                    option.classList.remove('active');
                });
                this.setState({
                    isOfficesClicked: false,
                });
                break;
            default:
                break;
        }

        e.target.classList.add('active');
    };

    private renderOfficeOptions = (): JSX.Element => {
        const offices = this.props.dashboard.offices;
        let hasMatchingOffice = false;
        const officeOptions = offices.map((office, i) => {
            const resourcePath = window.location.pathname.split('/')[3];
            if (resourcePath === convertToURLFormat(office.name)) {
                hasMatchingOffice = true;
            }
            return (
                <li key={i} className="office-option">
                    <Link
                        className={
                            resourcePath === convertToURLFormat(office.name)
                                ? 'office-option-content active'
                                : 'office-option-content'
                        }
                        to={`/dashboard/offices/${convertToURLFormat(
                            office.name,
                        )}`}
                    >
                        {office.name}
                    </Link>
                </li>
            );
        });

        // If there is no matching office in resource path,
        // redirect the user to the first office found in the list.
        if (
            !hasMatchingOffice &&
            window.location.pathname.split('/').length > 3 &&
            offices[0]
        ) {
            window.location.replace(
                `/dashboard/offices/${convertToURLFormat(offices[0].name)}`,
            );
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
        this.setState({
            isOfficesClicked: true,
        });
        const officeOptions = document.getElementsByClassName(
            'office-option-content',
        );
        Array.from(officeOptions).forEach(option => {
            option.classList.remove('active');
        });
        e.target.classList.add('active');
    };
}

export default Sidebar;
