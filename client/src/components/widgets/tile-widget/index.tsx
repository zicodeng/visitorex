import * as React from 'react';

import 'components/widgets/tile-widget/style';

interface TileWidgetProps {
    value: number;
    title: string;
}

class TileWidget extends React.Component<TileWidgetProps, {}> {
    constructor(props, context) {
        super(props, context);
    }

    public render() {
        const { value, title } = this.props;
        return (
            <div className="tile-widget">
                <h1 className="value">{value}</h1>
                <h4 className="title">{title}</h4>
            </div>
        );
    }
}

export default TileWidget;
