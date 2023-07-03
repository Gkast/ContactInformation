import {IncomingMessage, OutgoingMessage, ServerResponse} from "http";
import {URL} from "url";

export interface MyHttpResponse {
    status?: number;
    headers?: Map<string, string | string[]>
    body?: string | ((res: NodeJS.WritableStream) => void)
}

export type MyHttpListener = (req: IncomingMessage, url: URL) => Promise<MyHttpResponse>

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

export function pageNotFound() {
    return {
        status: 404,
        headers: new Map(Object.entries({'Content-Type': 'text/plain',})),
        body: 'Page not found'
    } as MyHttpResponse
}
