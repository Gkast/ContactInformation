import {IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import {MyHttpRequest, MyHttpResponse, HTTP_STATUS} from "./my-http";

export function nodeReqToMyReq(req: IncomingMessage): MyHttpRequest {
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
    res.statusMessage = HTTP_STATUS[res.statusCode]
    if (myRes.headers) {
        Object.keys(myRes.headers).forEach(name => {
            res.setHeader(name, myRes.headers[name]);
        })
    }
    !myRes.body ? res.end() :
        typeof myRes.body === 'string' ?
            res.end(myRes.body) : myRes.body(res);
}