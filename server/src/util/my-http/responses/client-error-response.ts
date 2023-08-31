import {MyHttpResponse} from "../http-handler";
import {htmlPageTemplate} from "./html-template";
import {mimeType} from "../../tools/mime-types";

export function pageNotFoundResponse(
    title = 'Page Not Found',
    contentHtml = `<h1>Page Not Found</h1>`): MyHttpResponse {
    return {
        status: 404,
        headers: {'content-type': mimeType("html")},
        body: htmlPageTemplate({title: title, contentHtml: contentHtml})
    }
}

export function wrongCredentialsResponse(
    title = 'Wrong Credentials',
    contentHtml = `<h1>Wrong Credentials</h1>`
): MyHttpResponse {
    return {
        status: 401,
        headers: {"content-type": mimeType("html")},
        body: htmlPageTemplate({title: title, contentHtml: contentHtml})
    }
}

export function badRequestResponse(
    title = 'Bad Request',
    contentHtml = `<h1>Bad Request</h1>`): MyHttpResponse {
    return {
        status: 400,
        headers: {"content-type": mimeType("html")},
        body: htmlPageTemplate({title: title, contentHtml: contentHtml})
    }
}