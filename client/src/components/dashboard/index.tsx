import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { fetchDashboard } from 'components/dashboard/actions';
import Sidebar from 'components/dashboard/sidebar';
import Overview from 'components/dashboard/main-panel/overview';
import Offices from 'components/dashboard/main-panel/offices';

import 'components/dashboard/style';

export interface Visitor {
    id: string;
    officeID: string;
    firstName: string;
    lastName: string;
    company: string;
    toSee: string;
    date: string;
    timeIn: string;
}

export interface Office {
    id: string;
    name: string;
    addr: string;
    creator: any;
    visitors: Visitor[];
}

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class Dashboard extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element | null {
        // Prevent unauthenticated user from viewing this dashboard.
        if (!this.props.admin.user) {
            return null;
        }
        const match = this.props.match;
        return (
            <div className="dashboard">
                <Sidebar />
                <Switch>
                    <Route
                        exact
                        path={`${match.url}/overview`}
                        component={Overview}
                    />
                    <Route
                        exact
                        path={`${match.url}/offices/:id`}
                        component={Offices}
                    />
                    {/* If no matching route is found, always render Overview as default main panel */}
                    <Redirect
                        from={`${match.url}`}
                        to={`${match.url}/overview`}
                    />
                    <Redirect
                        from={`${match.url}/:default`}
                        to={`${match.url}/overview`}
                    />
                </Switch>
            </div>
        );
    }

    public componentWillMount(): void {
        this.props.dispatch(fetchDashboard());
    }
}

export default Dashboard;
