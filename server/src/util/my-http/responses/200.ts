import {MyHttpResponse} from "../my-http";
import {UserDetails} from "../../../auth/authentication";
import {skeletonHtmlPage} from "../../../pages/skeleton-html/skeleton";

export interface PageParams {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
}

export function pageHtmlResponse(
    params: PageParams & NodeJS.Dict<any>,
    contentHtml: string): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-type": 'text/html'},
        body: skeletonHtmlPage(params, contentHtml)
    }
}

export function pageResponseStream(
    contentType: string,
    pageResponseStream: ((res: NodeJS.WritableStream) => void)): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-type": contentType},
        body: pageResponseStream
    }
}

export function downloadResponse(
    filename: string,
    pageResponse: string | ((res: NodeJS.WritableStream) => void)
): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-disposition": `attachment; ${filename ? `filename=${filename}` : ''}`},
        body: pageResponse
    }
}