import { onError } from "apollo-link-error";
import * as Auth from "../../utils/Auth";

const errorLink = onError(() => {});

export default errorLink;
