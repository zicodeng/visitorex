import * as React from 'react';
import { connect } from 'react-redux';

import 'components/dashboard/sidebar/style';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class Sidebar extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return <aside>Sidebar</aside>;
    }
}

export default Sidebar;
