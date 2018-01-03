import * as React from 'react';
import { connect } from 'react-redux';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class Office extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return <main className="main-panel office">Office</main>;
    }
}

export default Office;
