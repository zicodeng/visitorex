import * as React from 'react';

import 'components/floating-action-button/style';

interface Props {
    icon: JSX.Element;
    action: () => void;
}

class FloatingActionButton extends React.Component<Props, {}> {
    constructor(props, context) {
        super(props, context);
    }

    public render() {
        return (
            <div className="fab" onClick={e => this.handleClickFab()}>
                {this.props.icon}
            </div>
        );
    }

    private handleClickFab = (): void => {
        const clickAction = this.props.action;
        clickAction();
    };
}

export default FloatingActionButton;
