import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { fetchDashboard } from 'components/dashboard/actions';
import Sidebar from 'components/dashboard/sidebar';
import OverviewPanel from 'components/dashboard/main-panel/overview-panel';
import OfficePanel from 'components/dashboard/main-panel/office-panel';

import 'components/dashboard/style';

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
                        component={OverviewPanel}
                    />
                    <Route
                        exact
                        path={`${match.url}/offices/:name`}
                        component={OfficePanel}
                    />
                    {/* If no matching route is found, always render Overview Panel as default main panel */}
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
