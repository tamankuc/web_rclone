import Autosuggest from 'react-autosuggest';
import React from "react";
import { config } from './config';  // Import the config directly

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? config : config.filter(provider =>
        provider.Description.toLowerCase().slice(0, inputLength) === inputValue
    );
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.Prefix;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
    <div>
        {suggestion.Description}
    </div>
);

class ProviderAutoSuggest extends React.Component {
    constructor(props) {
        super(props);

        // Autosuggest is a controlled component.
        // This means that you need to provide an input value
        // and an onChange handler that updates this value (see below).
        // Suggestions also need to be provided to the Autosuggest,
        // and they are initially empty because the Autosuggest is closed.
        this.state = {
            suggestions: []
        };
    }


    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({value}) => {
        // console.log(value);
        this.setState({
            suggestions: getSuggestions(value)
        });
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };


    render() {
        const { value, onChange } = this.props;
        const currentConfig = config.find(provider => provider.Prefix === value);
        let renderVal = "";
        if (currentConfig === undefined) {
            renderVal = value;
        } else {
            renderVal = currentConfig.Description;
        }

        // Autosuggest will pass through all these props to the input.
        const inputProps = {
            placeholder: 'Type a provider type',
            value: renderVal,
            onChange: onChange
        };

        // Finally, render it!
        return (
            <Autosuggest
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                alwaysRenderSuggestions={true}
                highlightFirstSuggestion={true}
                inputProps={inputProps}
                // theme={{
                //     suggestionsList: 'suggestions-list', // Поддержка стандартных стилей
                //     suggestionHighlighted: 'suggestion-highlighted' // Подсветка активного элемента
                //   }}
                  renderSuggestionsContainer={({ containerProps, children, query }) => (
                    <div {...containerProps} style={{ maxHeight: '100px', overflowY: 'auto' }}>
                      {children}
                    </div>
                  )}
            />
        );
    }
}

export default ProviderAutoSuggest;
