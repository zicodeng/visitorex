import * as React from 'react';
import { connect } from 'react-redux';

import { Office } from 'dashboard/interfaces';
import { convertToURLFormat } from 'dashboard/sidebar/utils';
import TileWidget from 'components/widgets/tile-widget';

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

    public render(): JSX.Element | null {
        const office = this.getCurrentOffice();
        if (!office) {
            return null;
        }
        const totalVisitor = office.visitors ? office.visitors.length : 0;
        return (
            <main className="main-panel office">
                <h2 className="dashboard-title">{office.name}</h2>
                <TileWidget title={'Total Visitor'} value={totalVisitor} />
            </main>
        );
    }

    // Get current office based on resource path.
    private getCurrentOffice = (): Office | null => {
        const resourcePath = window.location.pathname.split('/');
        const officeName = resourcePath[resourcePath.length - 1];
        const offices = this.props.dashboard.offices;
        if (!offices) {
            return null;
        }

        for (let office of offices) {
            if (convertToURLFormat(office.name) === officeName) {
                return office;
            }
        }

        return null;
    };
}

export default OfficePanel;
