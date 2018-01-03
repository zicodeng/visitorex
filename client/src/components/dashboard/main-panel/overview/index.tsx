import * as React from 'react';
import { connect } from 'react-redux';

import 'components/dashboard/main-panel/overview';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class Overview extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return (
            <main className="main-panel overview">
                <h2 className="dashboard-title">Overview</h2>
            </main>
        );
    }
}

export default Overview;
