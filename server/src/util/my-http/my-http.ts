import {IncomingHttpHeaders, IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import {UserDetails} from "../../auth/authentication";

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

export function nodeReqToMyHttpReq(req: IncomingMessage): MyHttpRequest {
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

export function myResToNodeRes(myRes: MyHttpResponse, res: ServerResponse) {
    res.statusCode = myRes.status || 200;
    if (myRes.headers) {
        Object.keys(myRes.headers).forEach(name => {
            res.setHeader(name, myRes.headers[name]);
        })
    }
    !myRes.body ? res.end() :
        typeof myRes.body === 'string' ?
            res.end(myRes.body) : myRes.body(res);
}


export interface HttpRouter<T, X = any> {
    add(method: string, path: string, t: T): void;

    find(method: string, path: string): [T, X];
}