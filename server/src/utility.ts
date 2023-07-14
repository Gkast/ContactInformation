import {IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import * as fs from "fs";
import {UserDetails} from "./authentication";
import {pageNotFound} from "./page";

export interface MyHttpResponse {
    status?: number;
    headers?: Map<string, string | string[]>
    body?: string | ((res: NodeJS.WritableStream) => void)
}

export type MyHttpListener = (req: IncomingMessage, url: URL, user?: UserDetails) => Promise<MyHttpResponse>

export function writeMyResToNodeResponse(myres: MyHttpResponse, res: ServerResponse) {
    res.statusCode = myres.status || 200;
    if (myres.headers) {
        myres.headers.forEach((headerValue, name) => {
            res.setHeader(name, headerValue);
        });
    }
    if (!myres.body) {
        res.end();
    } else if (typeof myres.body === 'string') {
        res.end(myres.body);
    } else {
        myres.body(res);
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

export function staticFileListener(mimetypes: Map<string, string>): MyHttpListener {
    return (req, url) => {
        return fs.promises.stat('..' + url.pathname.toLowerCase()).then(result => {
            if (result.isFile()) {
                const forceDownload = url.searchParams.get('download') === '1';
                const ext = url.pathname.split('.').pop().toLowerCase();
                return {
                    headers: new Map(Object.entries(Object.assign(
                        {'Content-Type': mimetypes.get(ext) || 'application/octet-stream'},
                        forceDownload ? {'Content-Disposition': 'attachment'} : {}
                    ))),
                    body: res => fs.createReadStream('..' + url.pathname.toLowerCase()).pipe(res)
                } as MyHttpResponse;
            } else {
                return pageNotFound()
            }
        }).catch(pageNotFound);
    }
}

export function plusMinutes(d: Date, minutes_diff: number): Date {
    return new Date(d.getTime() + 1000 * 60 * minutes_diff);
}