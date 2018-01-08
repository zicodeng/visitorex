import * as React from 'react';
import { VictoryPie } from 'victory';

import 'components/widgets/pie-chart/style';

interface PieChartProps {
    data: any[];
    title: string;
}
class PieChart extends React.Component<PieChartProps, {}> {
    constructor(props) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <div className="pie-chart">
                <VictoryPie
                    data={this.props.data}
                    height={160}
                    labelRadius={40}
                    padding={0}
                    style={{
                        labels: {
                            fill: '#f8f9fa',
                            fontSize: 8,
                            fontFamily: 'Lato, sans-serif',
                        },
                    }}
                    events={[
                        {
                            target: 'data',
                            eventHandlers: {
                                // Toggle between label and value.
                                onClick: () => {
                                    return [
                                        {
                                            target: 'labels',
                                            mutation: props => {
                                                const label = props.datum.x;
                                                const value = props.datum.y;
                                                return props.text === label
                                                    ? { text: value }
                                                    : { text: label };
                                            },
                                        },
                                    ];
                                },
                            },
                        },
                    ]}
                    colorScale={[
                        '#e53935',
                        '#1e88e5',
                        '#00acc1',
                        '#43a047',
                        '#8e24aa',
                    ]}
                />
                <h4 className="title">{this.props.title}</h4>
                <p className="tips">
                    Tips: click any pie slice to view corresponding value
                </p>
            </div>
        );
    }
}

export default PieChart;
