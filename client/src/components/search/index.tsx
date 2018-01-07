import * as React from 'react';
import { connect } from 'react-redux';

import { Visitor } from 'dashboard/interfaces';
import { renderSearchResults } from 'components/search/actions';

import 'components/search/style';

interface SearchProps {
    inputChangeAction: (query: string) => void;
    results?: Visitor[];
    dispatch?: any;
    history?: any;
}

@connect(store => {
    return {
        results: store.search.results,
    };
})
class Search extends React.Component<SearchProps, any> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            query: '',
            historyResourcePath: '',
        };
    }

    public render(): JSX.Element {
        return (
            <div className="search">
                <div className="input-container">
                    <input
                        type="text"
                        ref="query"
                        placeholder="@tips"
                        onChange={e => this.handleChangeInput()}
                    />
                </div>
                {this.renderResults()}
            </div>
        );
    }

    public componentWillReceiveProps(): void {
        const historyResourcePath = this.state.historyResourcePath;
        const currentResourcePath = this.props.history.location.pathname;

        // If the user navigates away,
        // clear input box and query.
        if (currentResourcePath !== historyResourcePath) {
            this.refs.query['value'] = '';
            this.setState({
                query: '',
            });
        }

        this.setState({
            historyResourcePath: currentResourcePath,
        });
    }

    private handleChangeInput = (): void => {
        const query = this.refs.query['value'].trim().toLowerCase();
        // If no query is found in input,
        // clear search results.
        if (!query) {
            this.props.dispatch(renderSearchResults([]));
            return;
        }

        this.props.inputChangeAction(query);

        this.setState({
            query: query,
        });
    };

    private renderResults = (): JSX.Element | null => {
        const query = this.state.query;
        if (!query || !query.length) {
            return null;
        }

        // Render tips.
        if (query.startsWith('@tips')) {
            return this.renderTips();
        }

        const results = this.props.results;
        if (!results) {
            return null;
        }

        const li = results.map((result, i) => {
            return (
                <li key={i}>
                    <p>
                        {this.highlightQuery(result.firstName)}
                        &nbsp;
                        {this.highlightQuery(result.lastName)}
                        &nbsp;checked in at&nbsp;
                        {result.timeIn}
                        &nbsp;
                        {this.highlightQuery(result.date)}
                    </p>
                    <p>
                        He/she is from company&nbsp;
                        {this.highlightQuery(result.company)}
                        &nbsp;and here to see&nbsp;
                        {this.highlightQuery(result.toSee)}
                    </p>
                </li>
            );
        });

        return <ul className="results">{li}</ul>;
    };

    private renderTips = (): JSX.Element => {
        return (
            <ul className="results tips">
                <li>@all: search all visitors in this office.</li>
                <li>
                    You can also search by visitor's first name, last name,
                    company, to see, and/or date.
                </li>
            </ul>
        );
    };

    // Highlight the search query in the displayed results.
    private highlightQuery = (text: string): JSX.Element => {
        let query = this.state.query;
        const tokens: string[] = query.split(' ');

        for (const token of tokens) {
            if (text.toLowerCase().startsWith(token)) {
                // Ensure the result is displayed with original case.
                const highlightToken = text.substring(0, token.length);
                const rest = text.substring(token.length, text.length);
                return (
                    <span>
                        <span className="highlight highlight--level-1">
                            {highlightToken}
                        </span>
                        <span>{rest}</span>
                    </span>
                );
            }
        }
        return <span>{text}</span>;
    };
}

export default Search;
