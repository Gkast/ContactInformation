import * as fs from "fs";
import * as xmlEscapeLib from "xml-escape";
import {MyHttpListener, MyHttpResponse} from "./my-http";


import {pageNotFoundResponse} from "./page-responses";

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
                return pageNotFoundResponse()
            }
        }).catch(pageNotFoundResponse);
    }
}

export function range(start: number, end: number, step = 1) {
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (start < end) {
                start += step;
                return {value: start, done: false};
            }
            return {value: end, done: true};
        }
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

export function xmlEscape(xmlString: string): string {
    return xmlEscapeLib(xmlString);
}

export function starRating(stars: number): string {
    let rating = "";
    for (let i = 0; i < stars; i++) {
        rating += "★ ";
    }
    return rating;
}