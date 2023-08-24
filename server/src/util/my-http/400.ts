import {MyHttpResponse} from "./my-http";

import {skeletonHtmlPage} from "../../main/skeleton";
import {PageParams} from "./200";
import {UserDetails} from "../auth/authentication";

export function pageNotFoundResponse(
    title = 'Page Not Found',
    contentHtml = `<h1>Page Not Found</h1>`): MyHttpResponse {
    return {
        status: 404,
        headers: {'content-type': 'text/html'},
        body: skeletonHtmlPage({title: title}, contentHtml)
    }
}

export function wrongCredentialsResponse(
    title = 'Wrong Credentials',
    contentHtml = `<h1>Wrong Credentials</h1>`
): MyHttpResponse {
    return {
        status: 401,
        headers: {"content-type": 'text/html'},
        body: skeletonHtmlPage({title: title}, contentHtml)
    }
}

export function badRequestResponse(
    title = 'Bad Request',
    contentHtml = `<h1>Bad Request</h1>`): MyHttpResponse {
    return {
        status: 400,
        headers: {"content-type": "text/html"},
        body: skeletonHtmlPage({title: title}, contentHtml)
    }
}