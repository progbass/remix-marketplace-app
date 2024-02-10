import type {
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import type { ProductVariation } from "~/types/ProductVariation";
import type { Product } from "~/types/Product";

import AuthService from "../../services/Auth.service";
import getEnv from "get-env";
import { Fetcher } from "../../utils/fetcher";

import ProductForm from "./ProductForm";

function createNewProduct ():Product {
  return {
    name: "Nuevo producto",
    description: "",
    price: 0,
    stock: 0,
    categories: [],
    subcategories: [],
    models: [],
  };
}

// LOADER FUNCTION
export const loader = async ({ request, params, context }: LoaderFunctionArgs) => {
  console.log(params)
  const action = params.action;
  switch(action){
    case 'edit':
      if(!params.productId) {
        return redirect ("/me/products");
      }
      break;
    case 'new':
      //
      break;
    default:
      return redirect ("/me/products");
  }
  
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request }).catch((err) => {
    console.log(err);
    return null;
  });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user.token);

  // Get the shop data
  let productDetails = createNewProduct();
  if(action == 'edit'){
    productDetails = await myFetcher.fetch(
      `${getEnv().API_URL}/admin/myproducts/${params.productId}`,
      { method: "GET" }
    ).catch((err) => {
      console.log(err)
      throw new Error("Error fetching product data");
    });
  }

  // Get categories
  const categories = await myFetcher.fetch(`${getEnv().API_URL}/admin/categories`, {
    method: "GET",
  }).catch((err) => {
    console.log(err);
    throw new Error("Error fetching categories");
  });

  // Get subcategories
  let subcategories = [];
  if (productDetails?.categories && productDetails?.categories.length > 0) {
    // Get subcategories
    subcategories = await myFetcher.fetch(
      `${getEnv().API_URL}/admin/getSubcategories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: [productDetails.categories[0].id],
        }),
      }
    ).catch((err) => {
      throw new Error("Error fetching subcategories");
    });
  }
  subcategories = subcategories.length
    ? subcategories
    : [{ id: 0, name: "Sin subcategorías" }];

  // Return response
  return json({
    currentUser: user,
    productDetails,
    categories,
    subcategories,
  });
};

// ACTION FUNCTION
export const action = async ({ request, params }: LoaderFunctionArgs) => {
  
  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user.token);

  // Configure endpoint and method
  let formData = await request.formData();
  let keysToRemove:Array<string> = [];
  formData.forEach((value, key) => {
    console.log(key, typeof value, value);
    if (typeof value === "object" && value?.size == 0) {
      console.log("-------- delete --------");
      keysToRemove.push(key);
    }
  });
  // Remove keys from FormData
  keysToRemove.forEach((key) => formData.delete(key));

  // Configure endpoint and method
  let actionMethod = request.method;
  let endpoint = `${getEnv().API_URL}/admin/myproducts`;
  endpoint += formData.get("id") ? `/${formData.get("id")}` : ''; 

  // Convert FormData to object
  let productObject: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    productObject[key] = value;
  });

  // Update the product
  let errors = null;
  const product = await myFetcher.fetch(endpoint, {
    method: actionMethod,
    body: formData, //JSON.stringify(productObject),
  }).catch((err) => {
    console.log(err);
    // throw new Error("Error updating product");
    errors = err;
  });

  // Response
  console.log("action function: ", productObject, errors);

  switch (formData.get("_action")) {
    case "createVariation":
      // formData.forEach((value, key) => {(console.log(key, value))});
      // formData.set("models", [
      //   ...(formData.get('models') || []),
      // ]);
      return {
        product: product || null,
        errors: errors || null,
      };
      break;
    default:
      // return {
      //   product: product || null,
      //   errors: errors || null,
      // };
      if(errors){
        return {
          product: product || null,
          errors: errors || null,
        };
      }
      return redirect("/me/products");
  }
};

// 
export default function () {
  
  // Return JSX 
  return (
    <ProductForm />
  );
}
