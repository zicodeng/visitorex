import * as React from 'react';
import { connect } from 'react-redux';
import * as dashboardActions from 'components/dashboard/actions';

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
        dashboard: store.dashboard,
    };
})
class Dashboard extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return <div>Dashboard</div>;
    }

    public componentWillMount(): void {
        this.props.dispatch(dashboardActions.fetchOffices());
    }
}

export default Dashboard;
