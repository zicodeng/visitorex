import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
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
import { getCurrentHost, getSessionToken } from 'utils';

@connect(store => {
    return {};
})
class App extends React.Component<any, any> {
    public render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={CheckIn} />
                    <Route exact path="/admin-auth" component={AdminAuth} />
                    <Route exact path="/thank-you" component={ThankYou} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route component={NotFound} />
                </Switch>
            </BrowserRouter>
        );
    }

    public componentWillMount(): void {
        this.establishWebsocket();
    }

    private establishWebsocket = (): WebSocket => {
        const websocket = new WebSocket(
            `wss://${getCurrentHost()}/v1/ws?auth=${getSessionToken()}`,
        );
        websocket.addEventListener('error', function(error) {
            console.log(error);
        });
        websocket.addEventListener('open', function() {
            console.log('Websocket connection established');
        });
        websocket.addEventListener('close', function() {
            console.log('Websocket connection closed');
        });
        websocket.addEventListener('message', event => {
            const notification = JSON.parse(event.data);
            console.log(notification);
            switch (notification.type) {
                case 'Ready':
                    break;

                default:
                    break;
            }
        });
        return websocket;
    };
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app'),
);
