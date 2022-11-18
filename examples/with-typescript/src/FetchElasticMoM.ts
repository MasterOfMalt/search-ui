/* eslint-disable */

import JSON_URL from "json-url";
import { SearchkitTransporter } from "@searchkit/sdk/src/transporters";

export const getFetchElasticMoMClientTransporter = (
  searchKitConfig,
  searchUIConfig
) => {
  class FetchElasticMoMClientTransporter implements SearchkitTransporter {
    searchKitConfig: any = {};

    currentMethod: string = "ElasticSearchFromLukeViaNest";

    constructor(searchKitConfig) {
      this.searchKitConfig = searchKitConfig;
    }

    async performRequest(requestBody, overrides = {}) {
      searchUIConfig.state;
      const urlSearchPayload = this.getUrlPayload();

      if (!fetch)
        throw new Error("Fetch is not supported in this browser / environment");

      const url = `http://127.0.0.1:4010/page/list/cumque?search=${urlSearchPayload}`;

      const response = await fetch(url, {
        method: "GET"
      });
      const json = await response.json();

      json.aggregations.facet_bucket_all = { ...json.aggregations };

      return json;
    }

    async getUrlPayload() {
      const encodedQueryData = await this.encodeQueryData();

      switch (this.currentMethod) {
        case "AppSearchFromRob":
          return `http://127.0.0.1:4010/befe/page/list/cumque?query=${encodedQueryData}`;

        case "ElasticSearchFromLukeViaNest":
          return `http://127.0.0.1:4010/page/list/cumque?tradeGroupId=def&CountryId=abc&query=${encodedQueryData}`;
      }
    }

    async encodeQueryData() {
      const { current, resultsPerPage, filters, sortDirection, sortField } =
        searchUIConfig.state;

      const combinedFilters = this.combineFiltersWithFacets(filters);

      const searchData = {
        current,
        resultsPerPage,
        filters: combinedFilters,
        sort: {
          direction: sortDirection,
          field: sortField
        }
      };

      const compressionLZMACodec = JSON_URL("lzma");
      const JSON_URLencodedSearchParam_LZMA =
        await compressionLZMACodec.compress(searchData);

      return JSON_URLencodedSearchParam_LZMA;
    }

    combineFiltersWithFacets(filtersFromState: Array<any>): Array<any> {
      const combinedFilters = [];

      filtersFromState.forEach(
        (filter: any, index: number, filtersFromState: []) => {
          const combinedFilter = { ...filter };

          const relatedFacet = this.searchKitConfig.facets.find(
            (facet) => facet.config.field == filter.field
          );

          if (relatedFacet) {
            if (relatedFacet.config.options) {
              const initialValues = combinedFilter.values;
              combinedFilter.values = this.combineValues(
                initialValues,
                relatedFacet.config.options
              );
            }
          } else {
            console.error(
              `Failed to find a facet with the field name of ${filter.field} in the folowing facets. FetchElasticMoMClientTransporter.combineFiltersWithFacets().`,
              this.searchKitConfig.facets
            );
          }
          combinedFilters.push(combinedFilter);
        }
      );

      return combinedFilters;
    }

    combineValues(filterValues: [], facetOptions: []): any[] {
      const combinedValues = [];
      filterValues.forEach((value) => {
        const combinedValue: any = {
          /*name: value*/
        };

        const relatedOption: any = facetOptions.find(
          (facet: any) => facet.label == value
        );

        if (relatedOption.min) {
          combinedValue.from = relatedOption.min;
        }

        if (relatedOption.max) {
          combinedValue.to = relatedOption.max;
        }

        combinedValues.push(combinedValue);
      });
      return combinedValues;
    }
  }

  return new FetchElasticMoMClientTransporter(searchKitConfig);
};
