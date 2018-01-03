import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import store from 'components/store';

// Shared style
import 'stylesheets/shared';

// Routes
import AdminAuth from 'components/admin-auth';
import CheckIn from 'components/check-in';
import Dashboard from 'components/dashboard';
import NotFound from 'components/not-found';

class App extends React.Component<any, any> {
    public render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={CheckIn} />
                    <Route exact path="/admin-auth" component={AdminAuth} />
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
