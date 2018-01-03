import * as React from 'react';
import { connect } from 'react-redux';

import TileWidget from 'components/widgets/tile-widget';

import 'components/dashboard/main-panel/overview/style';

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
                {this.renderTotalReports()}
            </main>
        );
    }

    private renderTotalReports = (): JSX.Element | null => {
        const offices = this.props.dashboard.offices;
        if (!offices) {
            return null;
        }

        let totalVisitor = 0;
        offices.forEach(office => {
            if (!office.visitors) {
                return null;
            }
            totalVisitor += office.visitors.length;
        });

        const totalOffice = offices.length;

        const tileWidgets = [
            {
                title: 'Total Office',
                value: totalOffice,
            },
            {
                title: 'Total Visitor',
                value: totalVisitor,
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

export default Overview;
