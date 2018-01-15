import * as React from 'react';
import { connect } from 'react-redux';

import TileWidget from 'components/widgets/tile-widget';
import PieChart from 'components/widgets/pie-chart';

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
                <header className="dashboard-header">
                    <h2 className="dashboard-title">Overview</h2>
                </header>
                {this.renderTotalReports()}
                {this.renderGraphReport()}
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
                value: this.getTotalVisitors(visitorMap),
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

    // Calculate total visitors in all offices.
    private getTotalVisitors = (visitorMap): number => {
        let sum = 0;
        for (let visitors of visitorMap.values()) {
            sum += visitors.length;
        }
        return sum;
    };

    private renderGraphReport = (): JSX.Element | null => {
        const officeMap = this.props.dashboard.officeMap;
        const visitorMap = this.props.dashboard.visitorMap;

        if (!officeMap || !visitorMap) {
            return null;
        }

        const data: any[] = [];
        for (let [officeID, visitors] of visitorMap.entries()) {
            const officeName = officeMap.get(officeID).name;
            const total = visitors.length;

            // Don't display office with no visitor on pie chart.
            if (!total) {
                continue;
            }

            const item = {
                x: officeName,
                y: total,
            };
            data.push(item);
        }
        // If no available data, don't display pie chart.
        if (!data.length) {
            return null;
        }

        const title = 'TOTAL VISITORS IN EACH OFFICE';

        return (
            <div className="graph-report">
                <PieChart data={data} title={title} />
            </div>
        );
    };
}

export default OverviewPanel;
