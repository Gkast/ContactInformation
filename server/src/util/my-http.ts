import {IncomingHttpHeaders, IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import {UserDetails} from "../authentication/authentication";

export interface MyHttpRequest {
    remoteAddr?: string;
    method?: string;
    url: URL;
    httpVersion?: string;
    headers?: IncomingHttpHeaders;
    body?: NodeJS.ReadableStream;
    nodeJsReqObject?: IncomingMessage
}

export interface MyHttpResponse {
    status?: number;
    headers?: Map<string, string | string[]>
    body?: string | ((res: NodeJS.WritableStream) => void)
}

export type MyHttpListener = (req: MyHttpRequest, user?: UserDetails) => Promise<MyHttpResponse>

export function nodeJsToMyHttpRequest(req: IncomingMessage): MyHttpRequest {
    return {
        url: new URL('http://' + req.headers.host + req.url),
        body: req,
        nodeJsReqObject: req,
        headers: req.headers,
        method: req.method,
        httpVersion: req.httpVersion,
        remoteAddr: req.socket.remoteAddress,
    }
}

export function writeMyResToNodeResponse(myRes: MyHttpResponse, res: ServerResponse) {
    res.statusCode = myRes.status || 200;
    if (myRes.headers) {
        myRes.headers.forEach((headerValue, name) => {
            res.setHeader(name, headerValue);
        });
    }
    if (!myRes.body) {
        res.end();
    } else if (typeof myRes.body === 'string') {
        res.end(myRes.body);
    } else {
        myRes.body(res);
    }
}