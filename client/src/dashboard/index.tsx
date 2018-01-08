import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { fetchDashboard } from 'dashboard/actions';
import Sidebar from 'dashboard/sidebar';
import OverviewPanel from 'dashboard/main-panel/overview-panel';
import OfficePanel from 'dashboard/main-panel/office-panel';
import Footer from 'components/footer';

import 'dashboard/style';
import { getCurrentHost, getSessionToken } from 'utils';

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
            <div className="dashboard-wrapper">
                <div className="dashboard">
                    <Route component={Sidebar} />
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
                <Footer />
            </div>
        );
    }

    public componentWillMount(): void {
        this.props.dispatch(fetchDashboard());
        this.establishWebsocket();
    }

    private establishWebsocket = (): WebSocket => {
        const websocket = new WebSocket(
            `wss://${getCurrentHost()}/v1/ws?auth=${getSessionToken()}`,
        );
        websocket.addEventListener('error', function(error) {
            console.log(error);
        });
        websocket.addEventListener('open', function() {
            console.log('Websocket connection established');
        });
        websocket.addEventListener('close', function() {
            console.log('Websocket connection closed');
        });
        websocket.addEventListener('message', event => {
            const notification = JSON.parse(event.data);
            this.props.dispatch(notification);
        });
        return websocket;
    };
}

export default Dashboard;
