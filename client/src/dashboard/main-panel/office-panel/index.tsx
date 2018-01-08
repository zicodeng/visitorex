import * as React from 'react';
import { connect } from 'react-redux';

import { updateOfficeOption } from 'check-in/actions';
import FloatingActionButton from 'components/floating-action-button';
import { Office, Visitor } from 'dashboard/interfaces';
import { convertToURLFormat } from 'dashboard/sidebar/utils';
import Notification from 'components/notification';
import TileWidget from 'components/widgets/tile-widget';
import {
    clearNewVisitors,
    searchVisitors,
    searchAllVisitors,
} from 'dashboard/actions';
import { OFFICE_PATH_INDEX } from 'dashboard/sidebar';
import Search from 'components/search';
import { renderSearchResults } from 'components/search/actions';
import { SESSION_TOKEN_STORAGE_KEY } from 'utils';

import 'dashboard/main-panel/office-panel/style';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class OfficePanel extends React.Component<any, {}> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element | null {
        const dashboard = this.props.dashboard;
        const office = this.getCurrentOffice();
        if (!office) {
            return null;
        }
        const visitors = dashboard.visitorMap.get(office.id);
        const totalVisitor = visitors ? visitors.length : 0;

        return (
            <main className="main-panel office">
                <h2 className="dashboard-title">{office.name}</h2>
                <div className="search-container">
                    <Search
                        inputChangeAction={query =>
                            this.getSearchResults(query)
                        }
                        history={this.props.history}
                    />
                </div>
                <TileWidget title={'Total Visitor'} value={totalVisitor} />
                {this.renderFAB(office)}
                {this.renderNotification(office)}
            </main>
        );
    }

    // Get current office based on resource path.
    private getCurrentOffice = (): Office | null => {
        const resourcePath = window.location.pathname.split('/');
        const officePath = resourcePath[OFFICE_PATH_INDEX];
        const officeID = this.props.dashboard.officeNameToIDMap.get(officePath);

        const officeMap = this.props.dashboard.officeMap;
        return officeMap.get(officeID) ? officeMap.get(officeID) : null;
    };

    private getSearchResults = (query: string): void => {
        let visitors: Visitor[] = [];
        const office = this.getCurrentOffice();
        if (!office) {
            return;
        }

        const dispatch = this.props.dispatch;

        // Special search commands.
        if (query.startsWith('@')) {
            // Search all visitors in this office.
            if (query.startsWith('@all')) {
                dispatch(searchAllVisitors(office.id));
            }

            // If no special search command is matched,
            // clear search results.
            this.props.dispatch(renderSearchResults([]));
            return;
        }

        // Normal search.
        dispatch(searchVisitors(office.id, query));
    };

    // FAB redirects admin to visitor check-in screen.
    private renderFAB = (office: Office): JSX.Element => {
        const icon = <i className="fa fa-user-plus" aria-hidden="true" />;
        const action = (): void => {
            // Remove session token in local storage
            // to prevent visitors accidentally clicking back button
            // and viewing dashboard.
            window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
            this.props.history.push('/');
            this.props.dispatch(updateOfficeOption(office));
        };

        return <FloatingActionButton icon={icon} action={action} />;
    };

    private renderNotification = (office: Office): JSX.Element | null => {
        const newVisitorMap = this.props.dashboard.newVisitorMap;
        if (!newVisitorMap) {
            return null;
        }

        // Teaches Notification component what to render.
        const newVisitors = newVisitorMap.get(office.id);
        // Clears all notifications.
        const clearAction = (): void => {
            this.props.dispatch(clearNewVisitors(office.id));
        };

        return (
            <Notification
                list={newVisitors}
                clearAction={() => clearAction()}
            />
        );
    };
}

export default OfficePanel;
