import { redirect } from "@remix-run/node";
import { sessionStorage } from "./session.server";
import { AuthorizationError } from "remix-auth";
import { Fetcher } from "~/utils/fetcher";
import CookieUtils from "set-cookie-parser";
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

    // Get the CSRF value
    const csrfResponse = await fetch(`${this.API_URL}/sanctum/csrf-cookie`);
    const csrfCookies = await this.getCookiesFromResponse(csrfResponse);
    const xsrfCookie = csrfCookies.find((cookie) => cookie.name === "XSRF-TOKEN");

    // Attempt to login
    console.log(`${this.API_URL}/login`);
    // console.log({ email, password });
    const loginResponse = await fetch(`${this.API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-XSRF-TOKEN": xsrfCookie,
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    }).catch((err) => {
      console.log("caught it!", err);
    });

    // Verify the response
    if (loginResponse.ok) {
      // Get the login response
      const user = await loginResponse.json();

      return await Promise.resolve({
        response: loginResponse,
        user: user,
      }); //await Promise.resolve(user);
    }

    throw new AuthorizationError("Wrong credentials");
  }

  async login({
    request,
    autoRedirect = true,
  }): Promise<Response | User | null> {
    let currentUser;
    let userCookies;
    let headers;
    let xsrfCookie;
    let sessionCookie;

    // Attempt to authenticate the user
    try {
      const { user, response: userResponse } = await authenticator.authenticate(
        "user-pass",
        request,
        {
          throwOnError: true,
          // failureRedirect: '/login',
        }
      );

      const userCookies = await this.getCookiesFromResponse(userResponse);

      xsrfCookie = userCookies.find((cookie) => cookie.name === "XSRF-TOKEN");
      sessionCookie = userCookies.find(
        (cookie) => cookie.name === getEnv().API_SESSION_NAME
      );
      currentUser = user;

    } catch (error) {
      console.log("error", error);
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
    headers = await this.setSession(
      request,
      currentUser,
      sessionCookie?.value,
      xsrfCookie?.value
    );

    // Add the auth cookies to the response
    return autoRedirect ? redirect("/", { headers }) : [currentUser, headers];
  }

  async getCookiesFromResponse(response) {
    // Parse the cookies from the response and put them into an array
    const cookieHeader = response.headers.get("Set-Cookie") || undefined;
    var splitCookieHeaders: Array<any> =
      CookieUtils.splitCookiesString(cookieHeader);
    var cookies: Array<any> = CookieUtils.parse(splitCookieHeaders);

    return cookies;
  }

  async getCurrentUser({ request }) {
    // const user = (await this.isAuthenticated(request)) as User;
    // return await Promise.resolve(user);

    //
    let response;
    try {
      let session = await sessionStorage.getSession(
        request.headers.get("Cookie")
      );

      const myFetcher = new Fetcher(session.get("token"), request)
      response = await myFetcher.fetch(`${this.API_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.log("caught it!", e);
      throw new Error(e);
    }

    return response;
  }

  async currentToken(request = null) {
    if (request) {
      let session = await sessionStorage.getSession(
        request.headers.get("Cookie")
      );
      return session.get(authenticator.sessionKey);
    }
    try {
      // if(document){
      //     let getting = document.cookies.get({
      //     url: tabs[0].url,
      //     name: "favorite-color",
      //     });
      //     getting.then(logCookie);
      //  }
      let session = await sessionStorage.getSession();
      return session.get("Authorization");
    } catch (err) {
      console.log("Error getting cookie");
      console.log(err);
    }

    //
    return Promise.reject("No request object");
  }

  async setSession(request, user, userCookie, xsrfCookie): Promise<any> {
    // Get the session
    let session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    // Save the user token in the session
    session.set(authenticator.sessionKey, user);
    session.set("token", user?.token);
    session.set("laravel_session", userCookie); //user);
    session.set("csrf", xsrfCookie);

    // commit the session
    let headers = new Headers({
      "Set-Cookie": await sessionStorage.commitSession(session),
    });
    // headers.append(
    //   "Set-Cookie",
    //   `${
    //     getEnv().API_SESSION_NAME
    //   }=${userCookie}; path=/; samesite=lax; SameSite=None; Secure`
    // );
    // headers.append(
    //   "Set-Cookie",
    //   `XSRF-TOKEN=${xsrfCookie}; path=/; samesite=lax; SameSite=None; Secure`
    // );
    headers.append("Authorization", `Bearer ${user?.token}`);
    return headers;
  }

  async isAuthenticated(request) {
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
