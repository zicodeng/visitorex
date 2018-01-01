import * as React from 'react';
import { connect } from 'react-redux';

import { fetchDashboard } from 'components/dashboard/actions';
import Sidebar from 'components/dashboard/sidebar';

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
        return (
            <div>
                <Sidebar />
            </div>
        );
    }

    public componentWillMount(): void {
        this.props.dispatch(fetchDashboard());
    }
}

export default Dashboard;
