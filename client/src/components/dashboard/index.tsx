import * as React from 'react';
import { connect } from 'react-redux';

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
}

export default Dashboard;
