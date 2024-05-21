import algoliasearch from "algoliasearch";
import algoliarecommend from "@algolia/recommend";

const APP_ID = "A30F39KME9";
const API_KEY = "64e2db4db25b030e512f238fa20dbd90";

export const algoliaSearchClient = algoliasearch(APP_ID, API_KEY);
export const algoliaRecommendClient = algoliarecommend(APP_ID, API_KEY);
export const algoliaProductsIndex = "products";
export const algoliaProductsSuggestionsIndex = "products_query_suggestions";
export const algoliaAPISearchEndpoint = `https://${APP_ID}-dsn.algolia.net/1/indexes/${algoliaProductsIndex}/query`;
