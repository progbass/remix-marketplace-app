import { json, redirect } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import AuthService from "./Auth.service";

interface User {
    name: string,
    lastname: string,
    email: string,
    brand: string,
    nickname: string,
    avatar: string,
    token: string,
};

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | Error | null>(sessionStorage);

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ( {form, ...request} ) => {
        // get the data from the form...
        let email = form.get('email') as string;
        let password = form.get('password') as string;  

        let userData = await AuthService.loginAuthenticatorHandler({ email, password }, request)
            .catch((e) => {
                throw new AuthorizationError(e);
            });
            
        // Return user data if login was successful
        if(userData.token) {
            return {
                id: userData.id,
                name: userData.name,
                lastname: userData.lastname,
                phone: userData.phone,
                email: userData.email,
                brand: userData.brand,
                nickname: '',
                avatar: userData.avatar,
                token: userData.token
            };
        }

        // if problem with user throw error AuthorizationError
        throw new AuthorizationError("Bad Credentials")
    }),
    // each strategy has a name and can be changed to use another one
    // same strategy multiple times, especially useful for the OAuth2 strategy.
    "user-pass"
);
export default authenticator;
