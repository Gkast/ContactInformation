import {IncomingHttpHeaders, IncomingMessage} from "http";
import {URL} from "url";
import {UserDetails} from "../../auth/authentication";
import {HttpStatusCodes} from "./http-status";

export type MyHttpRequest = {
    remoteAddr?: string;
    method?: string;
    url: URL;
    httpVersion?: string;
    headers?: IncomingHttpHeaders;
    body?: NodeJS.ReadableStream;
    nodeJsReqObject?: IncomingMessage;
}

export type MyHttpResponse = {
    status?: HttpStatusCodes;
    headers?: IncomingHttpHeaders;
    body?: string | ((res: NodeJS.WritableStream) => void);
}

export type MyHttpListener = (req: MyHttpRequest, user?: UserDetails) => Promise<MyHttpResponse>