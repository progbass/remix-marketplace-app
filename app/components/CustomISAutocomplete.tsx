import React, { useMemo } from "react";
import { createElement, Fragment, useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";

import { autocomplete, AutocompleteOptions } from "@algolia/autocomplete-js";
import { usePagination, useSearchBox } from "react-instantsearch-core";
import { BaseItem } from "@algolia/autocomplete-core";
import { debounce } from "@algolia/autocomplete-shared";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import {
  algoliaSearchClient,
  algoliaProductsSuggestionsIndex,
} from "~/utils/algoliaClients";

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  className?: string;
  onSubmit?: (query:string) => void;
};

type SetInstantSearchUiStateOptions = {
  query: string;
};

export function Autocomplete({
  className,
  onSubmit: parentOnSubmit,
  ...autocompleteProps
}: AutocompleteProps) {
  //
  const autocompleteContainer = useRef<HTMLDivElement>(null);
  const panelRootRef = useRef(null);
  const rootRef = useRef(null);

  const { query, refine: setQuery } = useSearchBox();
  const { refine: setPage } = usePagination();

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query });
  const debouncedSetInstantSearchUiState = debounce(
    setInstantSearchUiState,
    500
  );

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    setPage(0);
  }, [instantSearchUiState]);

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: "instantsearch",
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({ query: item.label });

            // Execute parent onSubmit
            if(parentOnSubmit) parentOnSubmit(item.label)
          },
        };
      },
    });

    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient: algoliaSearchClient,
      indexName: algoliaProductsSuggestionsIndex,
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 6,
        });
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: "querySuggestionsPlugin",
          onSelect({ item }) {
            setInstantSearchUiState({ query: item.query });
          },
          getItems(params) {
            if (!params.state.query) {
              return [];
            }

            return source.getItems(params);
          },
        };
      },
    });

    return [recentSearches, querySuggestions];
  }, []);

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return undefined;
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      plugins,
      onReset() {
        setInstantSearchUiState({ query: "" });
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query });

        // Execute parent onSubmit
        if(parentOnSubmit) parentOnSubmit(state.query);
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debouncedSetInstantSearchUiState({
            query: state.query,
          });
        }
      },
      classNames: {
        root: "w-full rounded-xl",
        form: "border-gray-300 hover:border-secondary-500",
        input: "background-gray-500",
        ...autocompleteProps.classNames
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
    });

    return () => autocompleteInstance.destroy();
  }, [plugins]);

  return <div className={className} ref={autocompleteContainer} />;
}
