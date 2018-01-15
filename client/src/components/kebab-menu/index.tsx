import * as React from 'react';

import 'components/kebab-menu/style';

export interface MenuOption {
    label: string;
    action: () => void;
    className?: string;
}

interface Prop {
    menuOptions: MenuOption[];
}

interface State {
    showMenu: boolean;
}

class KebabMenu extends React.Component<Prop, State> {
    constructor(props) {
        super(props);

        this.state = {
            showMenu: false,
        };
    }

    public render(): JSX.Element {
        return (
            <div className="kebab-menu" onClick={e => this.handleClickMenu()}>
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                {this.renderOptions()}
            </div>
        );
    }

    private handleClickMenu = (): void => {
        const showMenu = this.state.showMenu;
        this.setState({
            showMenu: !showMenu,
        });
    };

    private renderOptions = (): JSX.Element => {
        const li = this.props.menuOptions.map((option, i) => {
            return (
                <li
                    key={i}
                    onClick={e => option.action()}
                    className={option.className ? option.className : undefined}
                >
                    {option.label}
                </li>
            );
        });

        let className = 'kebab-menu-options';
        if (this.state.showMenu) {
            className += ' active';
        }
        return <ul className={className}>{li}</ul>;
    };
}

export default KebabMenu;
