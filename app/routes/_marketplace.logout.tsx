import type {
  ActionFunctionArgs,
} from "@remix-run/node";
import AuthService from "../services/Auth.service";
import Errors from "../components/Errors";

//
export async function action({ request, context }: ActionFunctionArgs) {
  await AuthService.logout(request);
}