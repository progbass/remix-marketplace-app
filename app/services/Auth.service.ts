import { redirect } from "@remix-run/node";
import { sessionStorage } from "./session.server";
import { AuthorizationError } from "remix-auth";
import authenticator from "../services/auth.server";

import getEnv from "../../get-env";

// INTERFACES
interface User {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  brand: string;
  nickname: string;
  avatar: string;
  token: string;
  id: number;
}

// TYPES
type LoginData = {
  email: string;
  password: string;
};
type RegisterData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};
type UserData = {
  id: string;
  name: string;
  email: string;
};

// AUTHENTICATION SERVICE
class AuthService {
  private API_URL: string = getEnv().API_URL;

  async loginAuthenticatorHandler(data: LoginData): Promise<any> {
    const { email, password } = data;

    // do some validation, errors are in the sessionErrorKey
    if (!email || email?.length === 0)
      throw new AuthorizationError("Bad Credentials: Email is required");
    if (typeof email !== "string")
      throw new AuthorizationError("Bad Credentials: Email must be a string");

    if (!password || password?.length === 0)
      throw new AuthorizationError("Bad Credentials: Password is required");
    if (typeof password !== "string")
      throw new AuthorizationError(
        "Bad Credentials: Password must be a string"
      );

    // Attempt to login
    console.log(`${this.API_URL}/login`);
    console.log({ email, password });
    const loginResponse = await fetch(`${this.API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    }).catch((err) => {
      console.log("caught it!", err);
    });

    // Verify the response
    if (loginResponse.ok) {
      // Get the login response
      const user = await loginResponse.json();
      return await Promise.resolve(user);
    }
    console.log(loginResponse);
    throw new AuthorizationError("Wrong credentials");
  }

  async login({ request }): Promise<Response> {
    let currentUser;

    // Attempt to authenticate the user
    try {
      currentUser = await authenticator.authenticate("user-pass", request, {
        throwOnError: true,
        // failureRedirect: '/login',
      });

    } catch (error) {
      // // Because redirects work by throwing a Response, you need to check if the
      // // caught error is a response and return it or throw it again
      // if (error instanceof Response) return error;
      // if (error instanceof AuthorizationError) {
      //     // here the error is related to the authentication process
      //     console.log('AuthorizationError');
      //     return { errors: error.message };
      // }
      // here the error is a generic error that another reason may throw
      throw new Error(error);
    }

    // commit the session
    const headers = await this.setSession(request, currentUser);

    //
    return redirect("/me", { headers });
  }

  async getCurrentUser({ request }) {
    const user = (await this.isAuthenticated(request)) as User;
    return await Promise.resolve(user);

    //
    let response;
    let token = await this.currentToken(request);
    try {
      response = fetch(`${this.API_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.log("caught it!", e);
      throw new Error(e);
    }

    return response;
  }

  async currentToken(request=null) {
    if (request) {
      let session = await sessionStorage.getSession(
        request.headers.get("Cookie")
      );
      return session.get(authenticator.sessionKey);
    }
    try{
        // if(document){
        //     let getting = document.cookies.get({
        //     url: tabs[0].url,
        //     name: "favorite-color",
        //     });
        //     getting.then(logCookie);
        //  }
         let session = await sessionStorage.getSession();
          return session.get('Authorization');
    } catch (err){
        console.log('Error getting cookie');
        console.log(err)
    }

    //
    return Promise.reject("No request object");
  }

  async setSession(request, user): Promise<any> {
    // Get the session
    let session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // Save the user token in the session
    session.set(authenticator.sessionKey, user);

    // commit the session
    let headers = new Headers({
      "Set-Cookie": await sessionStorage.commitSession(session),
    });
    return headers;
  }

  async isAuthenticated(request) {
    const test = await authenticator.isAuthenticated(request);
    return authenticator.isAuthenticated(request);
  }

  async logout(request): Promise<any> {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // Logout from the API server
    let token = await this.currentToken(request);
    await fetch(`${this.API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Destroy Remix session
    await sessionStorage.destroySession(session);

    // Redirect to login
    return authenticator.logout(request, { redirectTo: "/login" });
  }
}
export default new AuthService();