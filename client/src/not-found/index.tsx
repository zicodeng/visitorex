import * as React from 'react';

import 'not-found/style';

class NotFound extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);
    }

    public render() {
        return (
            <div className="not-found">
                <h1>404</h1>
            </div>
        );
    }
}

export default NotFound;
