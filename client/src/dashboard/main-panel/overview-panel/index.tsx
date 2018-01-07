import * as React from 'react';
import { connect } from 'react-redux';

import TileWidget from 'components/widgets/tile-widget';

import 'dashboard/main-panel/overview-panel/style';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class OverviewPanel extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return (
            <main className="main-panel overview">
                <h2 className="dashboard-title">Overview</h2>
                {this.renderTotalReports()}
            </main>
        );
    }

    private renderTotalReports = (): JSX.Element | null => {
        const officeMap = this.props.dashboard.officeMap;
        const visitorMap = this.props.dashboard.visitorMap;

        if (!officeMap || !visitorMap) {
            return null;
        }

        const tileWidgets = [
            {
                title: 'Total Office',
                value: officeMap.size,
            },
            {
                title: 'Total Visitor',
                value: visitorMap.size,
            },
        ];

        const tileWidgetElements = tileWidgets.map((tileWidget, i) => {
            return (
                <TileWidget
                    key={i}
                    title={tileWidget.title}
                    value={tileWidget.value}
                />
            );
        });

        return <div className="total-reports">{tileWidgetElements}</div>;
    };
}

export default OverviewPanel;
