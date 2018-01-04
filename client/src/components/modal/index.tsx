import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import Dashboard from 'components/dashboard';
import { closeModal } from 'components/modal/actions';

import 'components/modal/style';

@connect(store => {
    return {
        modal: store.modal,
    };
})
// A Modal is just a wrapper of content.
// It simply displays whatever content you give to it,
// and decorates it with pop-up style.
class Modal extends React.Component<any, {}> {
    constructor(props, context) {
        super(props, context);
    }

    public render(): JSX.Element | null {
        const modal = this.props.modal;
        if (!modal.show) {
            return null;
        }
        return (
            <div className="modal">
                <div
                    className="overlay"
                    onClick={e => this.handleClickOverlay()}
                />
                <div className="content">{this.props.content}</div>
            </div>
        );
    }

    private handleClickOverlay = (): void => {
        this.props.dispatch(closeModal());
    };
}

export default Modal;
