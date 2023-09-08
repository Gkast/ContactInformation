import * as fs from "fs";
import * as xmlEscapeLib from "xml-escape"
import {MyHttpListener} from "./my-http/http-handler";
import {Readable} from "stream";
import {pageNotFoundResponse} from "./my-http/responses/client-error-response";
import {Pool, QueryOptions} from "mysql";
import {mimeLookup, mimeType} from "./tools/mime-types";

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

export function staticFileReqList(): MyHttpListener {
    return (req, user) => {
        const decodedPath = decodeURIComponent(req.url.pathname)
        return fs.promises.stat('..' + decodedPath).then(result => {
            if (result.isFile()) {
                const forceDownload = req.url.searchParams.get('download') === '1';
                const ext = decodedPath.split('.').pop();
                return {
                    headers: Object.assign({
                            'content-type': mimeLookup(ext) || mimeType("bin"),
                            "content-length": result.size.toString()
                        },
                        forceDownload ? {"content-disposition": 'attachment'} : {}
                    ),
                    body: res => fs.createReadStream('..' + decodedPath).pipe(res)
                };
            } else {
                return pageNotFoundResponse()
            }
        })
    }
}

export function intRange(start: number, arraySize: number, increment: number): number[] {
    let range = [];
    let temp = start;
    for (let i = 0; i < arraySize; i++) {
        range.push(temp);
        temp += increment;
    }
    return range;
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

export function mysqlQuery<T = any>(con: Pool, query: string | QueryOptions, values?: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
        con.query(query, values, (err, results, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        })
    })
}

export function rowNumberToLetter(n: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return alphabet.charAt(n - 1);
}

export function isoDateParser(isoDate: string): Date {
    const tempIsoDate = isoDate.split('-');
    const year = parseInt(tempIsoDate[0]);
    const month = parseInt(tempIsoDate[1]) - 1;
    const day = parseInt(tempIsoDate[2]);
    return new Date(year, month, day);
}