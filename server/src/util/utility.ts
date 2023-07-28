import * as fs from "fs";
import * as xmlEscapeLib from "xml-escape";
import {MyHttpListener, MyHttpResponse} from "./my-http/my-http";
import {IncomingHttpHeaders} from "http";
import {Readable} from "stream";
import {pageNotFoundResponse} from "./my-http/responses/400";

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
                    headers: Object.assign({
                            'content-type': mimetypes.get(ext) || 'application/octet-stream',
                            "content-length": result.size.toString()
                        } as IncomingHttpHeaders,
                        forceDownload ? {"content-disposition": 'attachment'} as IncomingHttpHeaders : {}
                    ),
                    body: res => fs.createReadStream('..' + decodedPath).pipe(res)
                } as MyHttpResponse;
            } else {
                return pageNotFoundResponse()
            }
        }).catch(pageNotFoundResponse);
    }
}

function intRange(start, arraySize, increment) {
    let range = [];
    let temp = start;
    for (let i = 0; i < arraySize; i++) {
        range.push(temp);
        temp += increment;
    }
    return range;
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

export function firstParam<T>(value: T | T[]): T {
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

export function stringAsStream(s: string): NodeJS.ReadableStream {
    return Readable.from(s);
}