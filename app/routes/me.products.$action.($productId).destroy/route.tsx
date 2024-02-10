import type {
  LoaderFunctionArgs,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";

import AuthService from "../../services/Auth.service";
import getEnv from "get-env";
import { Fetcher } from "../../utils/fetcher";

// ACTION FUNCTION
export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const productId = params?.productId;
  console.log("action function deletion: ", params )
  if(!productId){
    return {
      errors: "Error updating product",
    }
  }

  // Attempt to get the user from the session
  const user = await AuthService.getCurrentUser({ request });

  // Create sercer-side fetcher
  const myFetcher = new Fetcher(user.token);
  let errors = null;

  // Delete record
  await myFetcher.fetch(
    `${getEnv().API_URL}/admin/myproducts/${productId}`, 
    {
      method: 'DELETE',
    }
  ).catch((err) => {
    console.log(err);
    // throw new Error("Error updating product");
    errors = err;
  });
  
  if(errors){
    return {
      errors: errors || null,
    };
  }
  return redirect("/me/products");
};
