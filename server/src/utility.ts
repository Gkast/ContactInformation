import {IncomingHttpHeaders, IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import * as fs from "fs";
import {UserDetails} from "./authentication";
import {pageNotFound} from "./page";

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

export function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

export function parseRequestCookies(cookie: string) {
    const allCookiesMap = new Map<string, string>();
    if (cookie) {
        cookie.split(";").forEach(cookie => {
            const parts = cookie.split('=', 2);
            allCookiesMap.set(parts[0].trim(), parts[1]);
        });
    }
    return allCookiesMap;
}

export function staticFileReqList(mimetypes: Map<string, string>): MyHttpListener {
    return (req) => {
        const decodedPath = decodeURIComponent(req.url.pathname)
        return fs.promises.stat('..' + decodedPath).then(result => {
            if (result.isFile()) {
                const forceDownload = req.url.searchParams.get('download') === '1';
                const ext = decodedPath.split('.').pop();
                return {
                    headers: new Map(Object.entries(Object.assign(
                        {
                            'Content-Type': mimetypes.get(ext) || 'application/octet-stream',
                            'Content-Length': result.size
                        },
                        forceDownload ? {'Content-Disposition': 'attachment'} : {}
                    ))),
                    body: res => fs.createReadStream('..' + decodedPath).pipe(res)
                } as MyHttpResponse;
            } else {
                return pageNotFound()
            }
        }).catch(pageNotFound);
    }
}

export function plusMinutes(date: Date, minutes_diff: number): Date {
    return new Date(date.getTime() + 1000 * 60 * minutes_diff);
}

export function singleParam<T>(value: T | T[]): T {
    return value instanceof Array ? value[0] : value;
}

export function upperCaseFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}