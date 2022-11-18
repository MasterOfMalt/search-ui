/* eslint-disable */
import {
  buildSearchOptionsFromConfig,
  getConfig
} from "./config/config-helper";

import React from "react";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  WithSearch
} from "@elastic/react-search-ui";

import {
  BooleanFacet,
  Layout,
  SingleLinksFacet,
  SingleSelectFacet
} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// ./lib/search-ui-main/search-ui-app-search-connector/src
//import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import { getFetchElasticMoMClientTransporter } from "./FetchElasticMoM";

let stateHolder = {};

//const elasticMoMTransporter = new ElasticMomTransporter(stateHolder);
// const elasticMoMTransporterConstructor = (searchkitConfig, configuration) => {

//   class FetchElasticMoMClientTransporter {
//     prop1 = "fish";
//     prop2 = "frog";
//     config = {};

//     constructor(config) {
//       this.config = config;
//     }

//     method = () => {};
//   }

//   return new FetchElasticMoMClientTransporter({});

//   //return new ElasticMomTransporter(searchkitConfig, configuration);
// };

const connector = new ElasticsearchAPIConnector(
  {
    cloud: {
      // eslint-disable-next-line max-len
      id: "Dev_AzureLondonCpuOpt_02:dWtzb3V0aC5henVyZS5lbGFzdGljLWNsb3VkLmNvbTo0NDMkMDlkNzk4OGZmMGMwNGY3ZGExYTNkOTYzZGZjNTc3ZDAkYmQyMzlhY2U3N2I2NGI0YWFhZmExYjU1OWU1NjYyNWE="
    },
    index: ".ent-search-engine-documents-mom-dev", // index name where the search documents are contained
    // This key will be visible to everyone so ensure its setup with restricted privileges.
    // See Authentication section for more details.
    connectionOptions: {
      getCustomClientTransporter: getFetchElasticMoMClientTransporter
    }
  },
  // Added this for future use manipulating the outgoing query.
  (requestBody, requestState, config) => {
    console.log(JSON.stringify(requestBody));
    console.log(JSON.stringify(requestState));

    delete requestBody.query;
    delete requestBody.highlight;

    return requestBody;
  }
);

const currentYear = new Date().getFullYear();

let currentSearchTerm = "";

let currentSort = "";

const config = {
  initialState: { resultsPerPage: 25 },
  debug: true,
  searchQuery: {
    facets: {
      "dterms#isbestseller": { type: "value" },
      "dterms#stocklevel": { type: "value" },
      "range#price_0_uk": {
        type: "range",
        ranges: [
          { from: 0, to: 2147483647, name: "Show all" },
          { from: 0.01, to: 50, name: `0 – 50}` },
          { from: 50, to: 100, name: `50 – 100}` },
          { from: 100, to: 200, name: `100 – 200` },
          { from: 200, to: 400, name: `200 – 400` },
          { from: 400, to: 2147483647, name: `400 +` }
        ]
      },
      "range#userrating": {
        type: "range",
        ranges: [
          { from: 0, name: "Show all" },
          { from: 5, name: "5 ⭐ only" },
          { from: 4, name: "4 ⭐ and up" },
          { from: 3, name: "3 ⭐ and up" },
          { from: 2, name: "2 ⭐ and up" },
          { from: 1, name: "1 ⭐ and up" }
        ]
      },
      "dterms#volume": {
        type: "range",
        ranges: [
          { from: 35, to: 36, name: "35" },
          { from: 50, to: 51, name: "50" },
          { from: 70, to: 71, name: "70" },
          { from: 75, to: 76, name: "75" },
          { from: 100, to: 101, name: "100" }
        ]
      },
      "sterms#targettemplate": { type: "value" },
      "sterms#style": { type: "value" },
      "sterms#country": { type: "value" },
      "sterms#distillery": { type: "value", size: 100 },
      "sterms#region": { type: "value" },
      "dterms#isdiscounted": { type: "value" },
      "dterms#hasdram": { type: "value" },
      "range#age": {
        type: "range",
        ranges: [{ from: 0, to: 100, name: "0 - 100" }]
      },
      "range#vintage": {
        type: "range",
        ranges: [{ from: 1850, to: currentYear, name: `1850 - ${currentYear}` }]
      },
      "range#bottlingyear": {
        type: "range",
        ranges: [{ from: 1850, to: currentYear, name: `1850 - ${currentYear}` }]
      },
      "range#abv": {
        type: "range",
        ranges: [{ from: 0, to: 100, name: "0 - 100" }]
      }
    },
    disjunctiveFacets: [
      "range#price_0_uk",
      "range#userrating",
      "dterms#volume",
      "sterms#targettemplate",
      "sterms#style",
      "sterms#country",
      "sterms#distillery"
    ],
    ...buildSearchOptionsFromConfig()
  },

  autocompleteQuery: {
    results: {
      resultsPerPage: 1,
      result_fields: {
        distillery: {
          snippet: {
            size: 100,
            fallback: false
          },
          raw: {}
        },
        distilleryurl: { raw: {} }
      },
      search_fields: {
        distillery: {}
      }
    },
    suggestions: {
      types: {
        documents: {
          fields: ["searchfield"]
        }
      },
      size: 4
    }
  },
  apiConnector: connector,

  alwaysSearchOnInitialLoad: false
};

const sortConfig = [
  {
    name: "Relevance",
    value: "",
    direction: ""
  },
  {
    name: "Recently added",
    value: "releasedate",
    direction: "desc"
  },
  {
    name: "User rating",
    value: "userrating",
    direction: "desc"
  },
  {
    name: "Price – Low to high",
    value: "price",
    direction: "asc"
  },
  {
    name: "Price – High to low",
    value: "price",
    direction: "desc"
  },
  {
    name: "Name – A to Z",
    value: "title",
    direction: "asc"
  },
  {
    name: "Name – Z to A",
    value: "title",
    direction: "desc"
  }
];

export default function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch
        mapContextToProps={({ wasSearched }) => ({
          wasSearched
        })}
      >
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox debounceLength={0} />}
                  sideContent={
                    <div>
                      <Facet
                        field="dterms#stocklevel"
                        label="Hide out of stock"
                      />
                      <Facet
                        field={"range#price_0_uk"}
                        label="Price"
                        filterType="any"
                        show={6}
                      />
                      <Facet
                        field="range#userrating"
                        filterType="all"
                        show={6}
                        label="User rating"
                      />
                      <Facet
                        field="dterms#volume"
                        filterType="any"
                        label="Bottle size"
                      />
                      <Facet
                        field="targettemplate"
                        filterType="any"
                        label="Categories"
                      />
                      <Facet field="style" filterType="any" label="Styles" />
                      <Facet
                        field="distillery"
                        filterType="any"
                        isFilterable={true}
                        label="Distilleries &amp; brands"
                      />
                      <Facet
                        field="sterms#country"
                        filterType="any"
                        label="Countries"
                      />
                      <Facet
                        field="sterms#region"
                        filterType="any"
                        label="Regions"
                      />
                      <Facet field="dterms#isbestseller" label="Best Seller" />
                      <Facet
                        field="dterms#isdiscounted"
                        label="Special offer"
                      />
                      <Facet field="dterms#hasdram" label="3cl Sample" />
                      <Facet field="range#age" label="Age in years" />
                      <Facet field="range#bottlingyear" label="Bottling year" />
                      <Facet field="range#vintage" label="Vintage" />
                      <Facet field="range#abv" label="Alcohol by volume" />
                    </div>
                  }
                  bodyContent={
                    <Results
                      titleField="title"
                      urlField="nps_link"
                      thumbnailField="image_url"
                      shouldTrackClickThrough
                    />
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
