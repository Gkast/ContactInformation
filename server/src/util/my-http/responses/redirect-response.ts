import {MyHttpResponse} from "../http-handler";

export function redirectResponse(location: string): MyHttpResponse {
    return {
        status: 302,
        headers: {location: location},
    }
}