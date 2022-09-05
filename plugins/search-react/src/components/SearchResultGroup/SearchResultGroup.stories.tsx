/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ComponentType, useCallback, useState } from 'react';

import { Grid, MenuItem } from '@material-ui/core';
import DocsIcon from '@material-ui/icons/InsertDriveFile';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { JsonValue } from '@backstage/types';
import { createRouteRef } from '@backstage/core-plugin-api';
import { SearchQuery } from '@backstage/plugin-search-common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { CatalogIcon } from '@backstage/core-components';

import { searchApiRef, MockSearchApi } from '../../api';

import {
  SearchResultGroup,
  SearchResultGroupTextFilterField,
  SearchResultGroupSelectFilterField,
} from './SearchResultGroup';

const routeRef = createRouteRef({
  id: 'storybook.test-route',
});

const searchApiMock = new MockSearchApi({
  results: [
    {
      type: 'techdocs',
      document: {
        location: 'search/search-result1',
        title: 'Search Result 1',
        text: 'Some text from the search result 1',
      },
    },
    {
      type: 'techdocs',
      document: {
        location: 'search/search-result2',
        title: 'Search Result 2',
        text: 'Some text from the search result 2',
      },
    },
  ],
});

export default {
  title: 'Plugins/Search/SearchResultGroup',
  component: SearchResultGroup,
  decorators: [
    (Story: ComponentType<{}>) =>
      wrapInTestApp(
        <TestApiProvider apis={[[searchApiRef, searchApiMock]]}>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Story />
            </Grid>
          </Grid>
        </TestApiProvider>,
        { mountedRoutes: { '/hello': routeRef } },
      ),
  ],
};

export const Default = () => {
  const [query] = useState<Partial<SearchQuery>>({
    types: ['techdocs'],
  });

  return (
    <SearchResultGroup
      icon={<DocsIcon />}
      title="Documentation"
      query={query}
    />
  );
};

export const WithNoResults = () => {
  const [query] = useState<Partial<SearchQuery>>({
    types: ['techdocs'],
  });

  return (
    <TestApiProvider apis={[[searchApiRef, new MockSearchApi()]]}>
      <SearchResultGroup
        icon={<DocsIcon />}
        title="Documentation"
        query={query}
        noResultItemsText="No results found"
      />
    </TestApiProvider>
  );
};

export const WithFilters = () => {
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
      renderFilterOption={option => (
        <MenuItem key={option.value} onClick={handleFilterAdd(option.value)}>
          {option.label}
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
