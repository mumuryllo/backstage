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

import React, {
  ChangeEvent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import useAsync from 'react-use/lib/useAsync';
import qs from 'qs';

import {
  makeStyles,
  Theme,
  List,
  ListSubheader,
  Typography,
  Chip,
  InputBase,
  MenuItem,
  Select,
  Menu,
  TypographyProps,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ArrowRightIcon from '@material-ui/icons/ArrowForwardIos';

import { JsonValue } from '@backstage/types';
import { Link, LinkProps } from '@backstage/core-components';
import { AnalyticsContext, useApi } from '@backstage/core-plugin-api';
import { SearchQuery, SearchResult } from '@backstage/plugin-search-common';

import { DefaultResultListItem } from '../DefaultResultListItem';
import { searchApiRef } from '../../api';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    '&:not(:first-child)': {
      marginTop: theme.spacing(3),
    },
  },
  listSubheader: {
    display: 'flex',
    alignItems: 'center',
  },
  listSubheaderName: {
    marginLeft: theme.spacing(1),
    textTransform: 'uppercase',
  },
  listSubheaderChip: {
    color: theme.palette.text.secondary,
    margin: theme.spacing(0, 0, 0, 1.5),
  },
  listSubheaderFilter: {
    display: 'flex',
    color: theme.palette.text.secondary,
    margin: theme.spacing(0, 0, 0, 1.5),
  },
  listSubheaderLink: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  listSubheaderLinkIcon: {
    fontSize: 'inherit',
    marginLeft: theme.spacing(0.5),
  },
}));

/**
 * Props for {@link SearchResultGroupFilterFieldLayout}
 * @public
 */
export type SearchResultGroupFilterFieldLayoutProps = PropsWithChildren<{
  label: string;
  value?: JsonValue;
  onDelete: () => void;
}>;

/**
 * Default layout for a search group filter field.
 * @param props - see {@link SearchResultGroupFilterFieldLayoutProps}.
 * @public
 */
export const SearchResultGroupFilterFieldLayout = (
  props: SearchResultGroupFilterFieldLayoutProps,
) => {
  const classes = useStyles();
  const { label, children, ...rest } = props;

  return (
    <Chip
      {...rest}
      className={classes.listSubheaderFilter}
      variant="outlined"
      label={
        <>
          {label}: {children}
        </>
      }
    />
  );
};

const NullIcon = () => null;

/**
 * Common props for a result group filter field.
 * @public
 */
export type SearchResultGroupFilterFieldProps =
  SearchResultGroupFilterFieldLayoutProps & {
    onChange: (value: JsonValue) => void;
  };

const useSearchResultGroupTextFilterStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: 'inherit',
    '&:focus': {
      outline: 'none',
      padding: theme.spacing(0.5),
      background: theme.palette.common.white,
    },
    '&:not(:focus)': {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
}));

/**
 * A text field that can be used as filter on search result groups.
 * @example
 * ```
 * <SearchResultGroupTextFilterField
 *   id="lifecycle"
 *   label="Lifecycle"
 *   value={value}
 *   onChange={handleChangeFilter}
 *   onDelete={handleDeleteFilter}
 * />
 * ```
 * @public
 */
export const SearchResultGroupTextFilterField = (
  props: SearchResultGroupFilterFieldProps,
) => {
  const classes = useSearchResultGroupTextFilterStyles();
  const { label, value = 'None', onChange, onDelete } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <SearchResultGroupFilterFieldLayout label={label} onDelete={onDelete}>
      <Typography
        role="textbox"
        component="span"
        className={classes.root}
        onChange={handleChange}
        contentEditable
        suppressContentEditableWarning
      >
        {value}
      </Typography>
    </SearchResultGroupFilterFieldLayout>
  );
};

const useSearchResultGroupSelectFilterStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: 'inherit',
    '&:not(:focus)': {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '&:focus': {
      outline: 'none',
    },
    '&>div:first-child': {
      padding: 0,
    },
  },
}));

/**
 * A select field that can be used as filter on search result groups.
 * @example
 * ```
 * <SearchResultGroupSelectFilterField
 *   id="lifecycle"
 *   label="Lifecycle"
 *   value={filters.lifecycle}
 *   onChange={handleChangeFilter}
 *   onDelete={handleDeleteFilter}
 * >
 *   <MenuItem value="experimental">Experimental</MenuItem>
 *   <MenuItem value="production">Production</MenuItem>
 *  </SearchResultGroupSelectFilterField>
 * ```
 * @public
 */
export const SearchResultGroupSelectFilterField = (
  props: PropsWithChildren<SearchResultGroupFilterFieldProps>,
) => {
  const classes = useSearchResultGroupSelectFilterStyles();
  const { label, value = 'none', onChange, onDelete, children } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<{ value: unknown }>) => {
      onChange(e.target.value as JsonValue);
    },
    [onChange],
  );

  return (
    <SearchResultGroupFilterFieldLayout label={label} onDelete={onDelete}>
      <Select
        className={classes.root}
        value={value}
        onChange={handleChange}
        input={<InputBase />}
        IconComponent={NullIcon}
      >
        <MenuItem value="none">None</MenuItem>
        {children}
      </Select>
    </SearchResultGroupFilterFieldLayout>
  );
};

/**
 * Props for {@link SearchResultGroupLayout}
 * @public
 */
export type SearchResultGroupLayoutProps<FilterOption> = {
  /**
   * Icon that representing a result group.
   */
  icon: JSX.Element;
  /**
   * The results group title content, it could be a text or an element.
   */
  title: ReactNode;
  /**
   * Props for the results group title.
   */
  titleProps?: Partial<TypographyProps>;
  /**
   * The results group link content, it could be a text or an element.
   */
  link?: ReactNode;
  /**
   * Props for the results group link, the "to" prop defaults to "/search".
   */
  linkProps?: Partial<LinkProps>;
  /**
   * A generic filter options that is rendered on the "Add filter" dropdown.
   */
  filterOptions?: FilterOption[];
  /**
   * Function to customize how filter options are rendered.
   * @remarks Defaults to a menu item where its value and label bounds to the option string.
   */
  renderFilterOption?: (filterOption: FilterOption) => JSX.Element;
  /**
   * A list of search filter keys, also known as filter field names.
   */
  filterFields?: string[];
  /**
   * Function to customize how filter chips are rendered.
   */
  renderFilterField?: (key: string) => JSX.Element | null;
  /**
   * Search results to be rendered as a group.
   */
  resultItems?: SearchResult[];
  /**
   * Function to customize how result items are rendered.
   */
  renderResultItem?: (resultItem: SearchResult) => JSX.Element;
  /**
   * A text to be rendered when "resultItems" is undefined or empty.
   */
  noResultItemsText?: string;
};

/**
 * Default layout for rendering search results in a group.
 * @param props - see {@link SearchResultGroupLayoutProps}.
 * @public
 */
export function SearchResultGroupLayout<FilterOption>(
  props: SearchResultGroupLayoutProps<FilterOption>,
) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    icon,
    title,
    titleProps = {},
    link,
    linkProps = {},
    filterOptions,
    renderFilterOption,
    filterFields,
    renderFilterField,
    resultItems,
    renderResultItem,
    noResultItemsText,
  } = props;

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <List className={classes.root} disablePadding dense>
      <ListSubheader className={classes.listSubheader}>
        {icon}
        <Typography
          className={classes.listSubheaderName}
          component="strong"
          {...titleProps}
        >
          {title}
        </Typography>
        {filterOptions ? (
          <Chip
            className={classes.listSubheaderChip}
            component="button"
            icon={<AddIcon />}
            variant="outlined"
            label="Add filter"
            aria-controls="filters-menu"
            aria-haspopup="true"
            onClick={handleClick}
          />
        ) : null}
        {filterOptions ? (
          <Menu
            id="filters-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            keepMounted
          >
            {filterOptions.map(filterOption =>
              renderFilterOption ? (
                renderFilterOption(filterOption)
              ) : (
                <MenuItem
                  key={String(filterOption)}
                  value={String(filterOption)}
                >
                  {filterOption}
                </MenuItem>
              ),
            )}
          </Menu>
        ) : null}
        {filterFields?.map(
          filterField => renderFilterField?.(filterField) ?? null,
        )}
        <Link className={classes.listSubheaderLink} to="/search" {...linkProps}>
          {link ?? (
            <>
              See all
              <ArrowRightIcon className={classes.listSubheaderLinkIcon} />
            </>
          )}
        </Link>
      </ListSubheader>
      {resultItems?.length
        ? resultItems.map(resultItem => renderResultItem?.(resultItem) ?? null)
        : null}
      {!resultItems?.length && noResultItemsText ? (
        <ListItem>
          <ListItemText>{noResultItemsText}</ListItemText>
        </ListItem>
      ) : null}
    </List>
  );
}

/**
 * Props for {@link SearchResultGroup}.
 * @public
 */
export type SearchResultGroupProps<FilterOption> =
  SearchResultGroupLayoutProps<FilterOption> & {
    /**
     * A search query used for requesting the results to be grouped.
     */
    query: Partial<SearchQuery>;
  };

/**
 * Given a query, search for results and render them as a group.
 * @param props - see {@link SearchResultGroupProps}.
 * @public
 */
export function SearchResultGroup<FilterOption>(
  props: SearchResultGroupProps<FilterOption>,
) {
  const searchApi = useApi(searchApiRef);
  const {
    query,
    link,
    linkProps = {},
    renderResultItem = ({ document }) => (
      <DefaultResultListItem key={document.location} result={document} />
    ),
    ...rest
  } = props;

  const { value } = useAsync(
    () =>
      searchApi.query({
        term: query.term ?? '',
        types: query.types ?? [],
        filters: query.filters ?? {},
        pageCursor: query.pageCursor,
      }),
    [query],
  );

  const to = `/search?${qs.stringify(
    {
      query: query.term,
      types: query.types,
      filters: query.filters,
      pageCursor: query.pageCursor,
    },
    { arrayFormat: 'brackets' },
  )}`;

  return (
    <AnalyticsContext
      attributes={{
        pluginId: 'search',
        extension: 'SearchResultGroup',
      }}
    >
      <SearchResultGroupLayout
        {...rest}
        link={link}
        linkProps={{ to, ...linkProps }}
        resultItems={value?.results}
        renderResultItem={renderResultItem}
        filterFields={Object.keys(query.filters ?? {})}
      />
    </AnalyticsContext>
  );
}
