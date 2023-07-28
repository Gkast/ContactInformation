import {MyHttpResponse} from "../my-http";

import {skeletonHtmlPage} from "../../../pages/skeleton-page-html/skeleton-page";

export function pageNotFoundResponse(): MyHttpResponse {
    return {
        status: 404,
        headers: {'content-type': 'text/html'},
        body: skeletonHtmlPage({title: "Page Not Found"}, `<h1>Page Not Found</h1>`)
    }
}

export function wrongCredentialsResponse(): MyHttpResponse {
    return {
        status: 401,
        headers: {"content-type": 'text/html'},
        body: skeletonHtmlPage({title: "Wrong Credentials"}, '<h1>Wrong Credentials</h1>')
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