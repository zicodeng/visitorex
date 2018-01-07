import * as React from 'react';
import { connect } from 'react-redux';

import 'components/notification/style';

interface NotificationProps {
    list: any[];
    clearAction: () => void;
}

class Notification extends React.Component<NotificationProps, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showNotification: false,
        };
    }

    public render(): JSX.Element | null {
        const list = this.props.list;
        if (!list || !list.length) {
            return null;
        }

        const total = list.length;

        return (
            <div className="notification">
                <h4
                    onClick={e => this.handleClickNotification()}
                    className={
                        this.state.showNotification ? 'active' : undefined
                    }
                >
                    {`${total} ${
                        total === 1 ? 'visitor' : 'visitors'
                    } just checked in`}
                </h4>
                {this.renderDetails()}
                {this.state.showNotification ? (
                    <button
                        className="clear-btn"
                        onClick={e => this.handleClickClearBtn()}
                    >
                        Clear
                    </button>
                ) : null}
            </div>
        );
    }

    public componentWillReceiveProps(): void {
        // If the user navigates away to different panel,
        // hide notification.
        this.setState({
            showNotification: false,
        });
    }

    // If notification is clicked, display details.
    private handleClickNotification = (): void => {
        const showNotification = this.state.showNotification;
        this.setState({
            showNotification: !showNotification,
        });
    };

    private renderDetails = (): JSX.Element | null => {
        const showNotification = this.state.showNotification;
        if (!showNotification) {
            return null;
        }

        const list = this.props.list;
        const li = list.map((item, i) => {
            return (
                <li key={i}>
                    <p>
                        <span className="highlight highlight--level-1">
                            {item.firstName}
                        </span>&nbsp;
                        <span className="highlight highlight--level-1">
                            {item.lastName}
                        </span>&nbsp; checked in at&nbsp;
                        <span className="highlight highlight--level-2">
                            {item.timeIn}
                        </span>&nbsp;
                        <span className="highlight highlight--level-2">
                            {item.date}
                        </span>
                    </p>
                    <p>
                        He/she is from company&nbsp;
                        <span className="highlight highlight--level-2">
                            {item.company}
                        </span>{' '}
                        and here to see&nbsp;
                        <span className="highlight highlight--level-1">
                            {item.toSee}
                        </span>
                    </p>
                </li>
            );
        });

        return <ul className="details">{li}</ul>;
    };

    private handleClickClearBtn = (): void => {
        this.props.clearAction();
    };
}

export default Notification;
