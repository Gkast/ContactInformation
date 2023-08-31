import {MyHttpResponse} from "../http-handler";
import {UserDetails} from "../../../auth/authentication";
import {htmlPageTemplate} from "./html-template";
import {mimeType} from "../../tools/mime-types";

export type PageParams = {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
    contentHtml?: string
}

export function pageHtmlResponse(
    params: PageParams): MyHttpResponse {
    return {
        status: 200,
        headers: {"content-type": mimeType("html")},
        body: htmlPageTemplate(params)
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