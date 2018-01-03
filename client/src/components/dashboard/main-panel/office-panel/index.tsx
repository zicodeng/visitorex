import * as React from 'react';
import { connect } from 'react-redux';

import { Office } from 'components/dashboard/interfaces';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class OfficePanel extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        this.findCurrentOffice();
        return <main className="main-panel office">Office</main>;
    }

    private findCurrentOffice = () => {
        const resourcePath = window.location.pathname.split('/');
        const officeName = resourcePath[resourcePath.length - 1];
    };
}

export default OfficePanel;
