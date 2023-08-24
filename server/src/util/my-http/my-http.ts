import {IncomingHttpHeaders, IncomingMessage} from "http";
import {URL} from "url";
import {UserDetails} from "../auth/authentication";

export interface MyHttpRequest {
    remoteAddr?: string;
    method?: string;
    url: URL;
    httpVersion?: string;
    headers?: IncomingHttpHeaders;
    body?: NodeJS.ReadableStream;
    nodeJsReqObject?: IncomingMessage;
}

export interface MyHttpResponse {
    status?: number;
    headers?: IncomingHttpHeaders;
    body?: string | ((res: NodeJS.WritableStream) => void);
}

export type MyHttpListener = (req: MyHttpRequest, user?: UserDetails) => Promise<MyHttpResponse>

export interface HttpRouter<T, X = any> {
    add(method: string, path: string, t: T): void;

    find(method: string, path: string): [T, X];
}