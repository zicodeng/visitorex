import * as React from 'react';

import 'components/footer/style';

class Footer extends React.Component<{}, {}> {
    constructor(props) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <footer className="footer">
                <p>
                    Created with{' '}
                    <span className="heart">
                        <i className="fa fa-heart" aria-hidden="true" />
                    </span>{' '}
                    by Zico Deng
                </p>
            </footer>
        );
    }
}

export default Footer;
