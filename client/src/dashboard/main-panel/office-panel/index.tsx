import * as React from 'react';
import { connect } from 'react-redux';

import { updateOfficeOption } from 'check-in/actions';
import FloatingActionButton from 'components/floating-action-button';
import { Office } from 'dashboard/interfaces';
import { convertToURLFormat } from 'dashboard/sidebar/utils';
import Notification from 'components/notification';
import TileWidget from 'components/widgets/tile-widget';
import { clearNewVisitors } from 'dashboard/actions';
import { OFFICE_PATH_INDEX } from 'dashboard/sidebar';

@connect(store => {
    return {
        admin: store.admin,
        dashboard: store.dashboard,
    };
})
class OfficePanel extends React.Component<any, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            currentOffice: null,
        };
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

        const officeMap = this.props.dashboard.officeMap;
        if (!officeMap.has(officePath)) {
            return null;
        }

        return officeMap.get(officePath);
    };

    // FAB redirects admin to visitor check-in screen.
    private renderFAB = (office: Office): JSX.Element => {
        const icon = <i className="fa fa-user-plus" aria-hidden="true" />;
        const action = (): void => {
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
            console.log(office.id);
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
