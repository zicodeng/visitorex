import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import store from 'store';

// Shared style
import 'stylesheets/shared';

// Routes
import AdminAuth from 'admin-auth';
import CheckIn from 'check-in';
import Dashboard from 'dashboard';
import ThankYou from 'thank-you';
import NotFound from 'not-found';

class App extends React.Component<any, any> {
    public render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={AdminAuth} />
                    <Route exact path="/check-in" component={CheckIn} />
                    <Route exact path="/thank-you" component={ThankYou} />
                    <Route path="/dashboard" component={Dashboard} />
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
