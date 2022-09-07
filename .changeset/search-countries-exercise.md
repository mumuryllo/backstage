---
'@backstage/plugin-search-react': minor
---

Creates a component for querying and rendering search results as a group, see below for an example:

```jsx
import React, { useState, useCallback } from 'react';

import { MenuItem } from '@material-ui/core';

import { JsonValue } from '@backstage/types';
import { CatalogIcon } from '@backstage/core-components';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import {
  SearchResultGroup,
  SearchResultGroupTextFilterField,
  SearchResultGroupSelectFilterField,
} from @backstage/plugin-search-react;
import { SearchQuery } from '@backstage/plugin-search-common';

const CatalogResultsGroup = () => {
  const [query, setQuery] = useState<Partial<SearchQuery>>({
    types: ['software-catalog'],
  });

  const filterOptions = [
    {
      label: 'Lifecycle',
      value: 'lifecycle',
    },
    {
      label: 'Owner',
      value: 'owner',
    },
  ];

  const handleFilterAdd = useCallback(
    (key: string) => () => {
      setQuery(prevQuery => {
        const { filters: prevFilters, ...rest } = prevQuery;
        const newFilters = { ...prevFilters, [key]: undefined };
        return { ...rest, filters: newFilters };
      });
    },
    [],
  );

  const handleFilterChange = useCallback(
    (key: string) => (value: JsonValue) => {
      setQuery(prevQuery => {
        const { filters: prevFilters, ...rest } = prevQuery;
        const newFilters = { ...prevFilters, [key]: value };
        return { ...rest, filters: newFilters };
      });
    },
    [],
  );

  const handleFilterDelete = useCallback(
    (key: string) => () => {
      setQuery(prevQuery => {
        const { filters: prevFilters, ...rest } = prevQuery;
        const newFilters = { ...prevFilters };
        delete newFilters[key];
        return { ...rest, filters: newFilters };
      });
    },
    [],
  );

  return (
    <SearchResultGroup
      query={query}
      icon={<CatalogIcon />}
      title="Software Catalog"
      link="See all software catalog results"
      filterOptions={filterOptions}
      renderFilterOption={({ label, value }) => (
        <MenuItem key={value} onClick={handleFilterAdd(value)}>
          {label}
        </MenuItem>
      )}
      renderFilterField={(key: string) => (
        <>
          {key === 'lifecycle' && (
            <SearchResultGroupSelectFilterField
              key={key}
              label="Lifecycle"
              value={query.filters?.lifecycle}
              onChange={handleFilterChange('lifecycle')}
              onDelete={handleFilterDelete('lifecycle')}
            >
              <MenuItem value="production">Production</MenuItem>
              <MenuItem value="experimental">Experimental</MenuItem>
            </SearchResultGroupSelectFilterField>
          )}
          {key === 'owner' && (
            <SearchResultGroupTextFilterField
              key={key}
              label="Owner"
              value={query.filters?.owner}
              onChange={handleFilterChange('owner')}
              onDelete={handleFilterDelete('owner')}
            />
          )}
        </>
      )}
      renderResultItem={({ document, highlight, rank }) => (
        <CatalogSearchResultListItem
          key={document.location}
          result={document}
          highlight={highlight}
          rank={rank}
        />
      )}
    />
  );
};
```
