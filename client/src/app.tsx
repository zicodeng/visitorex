import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import store from 'components/store';

// Routes
import CheckIn from 'components/check-in';
import Admin from 'components/admin';
import NotFound from 'components/not-found';

class App extends React.Component<any, any> {
    public render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={CheckIn} />
                    <Route exact path="/admin" component={Admin} />
                    <Route component={NotFound} />
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app'),
);
