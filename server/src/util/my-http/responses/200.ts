import {MyHttpResponse} from "../my-http";
import {UserDetails} from "../../../auth/authentication";
import {skeletonHtmlPage} from "../../../pages/skeleton-page-html/skeleton-page";

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

export function PageResponseStream(
    contentType: string,
    response: ((res: NodeJS.WritableStream) => void)): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-type": contentType},
        body: response
    }
}

export function downloadResponse(
    filename: string,
    bodyResponse: string | ((res: NodeJS.WritableStream) => void)
): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-disposition": `attachment; ${filename ? `filename=${filename}` : ''}`},
        body: bodyResponse
    }
}