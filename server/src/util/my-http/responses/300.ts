import {MyHttpResponse} from "../my-http";

export function redirectResponse(location: string): MyHttpResponse {
    return {
        status: 302,
        headers: {location: location},
    }
}