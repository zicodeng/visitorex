import * as React from 'react';

import 'thank-you/style';

class ThankYou extends React.Component<any, {}> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element {
        return (
            <div className="thank-you">
                <h1 className="title">Thank You</h1>
                <button
                    className="back-btn"
                    onClick={e => this.handleClickBackBtn()}
                >
                    Back
                </button>
            </div>
        );
    }

    private handleClickBackBtn = (): void => {
        this.props.history.replace('/');
    };
}

export default ThankYou;
