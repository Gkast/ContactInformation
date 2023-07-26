import {UserDetails} from "../authentication/authentication";
import {skeletonHtmlPage} from "./html-snippets";
import {MyHttpResponse} from "./my-http";

export function pageHtmlResponse(pageParams: {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
} & NodeJS.Dict<any>, contentHtml: string): MyHttpResponse {
    return {
        status: 200,
        headers: new Map(Object.entries({'Content-Type': 'text/html'})),
        body: skeletonHtmlPage(pageParams, contentHtml)
    }
}

export function pageNotFoundResponse(): Promise<MyHttpResponse> {
    return Promise.resolve({
        status: 404,
        headers: new Map(Object.entries({'Content-Type': 'text/html'})),
        body: skeletonHtmlPage({title: "Page Not Found"}, '<h1>Page Not Found</h1>')
    } as MyHttpResponse)
}

export function wrongCredentialsResponse(): Promise<MyHttpResponse> {
    return Promise.resolve({
        status: 401,
        headers: new Map(Object.entries({'Content-Type': 'text/html'})),
        body: skeletonHtmlPage({title: "Wrong Credentials"}, '<h1>Wrong Credentials</h1>')
    } as MyHttpResponse)
}

export function redirectResponse(location: string): MyHttpResponse {
    return {
        status: 302,
        headers: new Map(Object.entries({'Location': location})),
    }
}