import {IncomingMessage, ServerResponse} from "http";
import {URL} from "url";
import {MyHttpRequest, MyHttpResponse} from "./http-handler";
import {getHttpStatusMessage} from "./http-status";

export function nodeReqToMyReq(nodeReq: IncomingMessage): MyHttpRequest {
    return {
        url: new URL('http://' + nodeReq.headers.host + nodeReq.url),
        body: nodeReq,
        nodeJsReqObject: nodeReq,
        headers: nodeReq.headers,
        method: nodeReq.method,
        httpVersion: nodeReq.httpVersion,
        remoteAddr: nodeReq.socket.remoteAddress,
    }
}

export function myResToNodeRes(myRes: MyHttpResponse, nodeRes: ServerResponse) {
    nodeRes.statusCode = myRes.status || 200;
    nodeRes.statusMessage = getHttpStatusMessage(nodeRes.statusCode);
    if (myRes.headers) {
        Object.keys(myRes.headers).forEach(name => {
            nodeRes.setHeader(name, myRes.headers[name]);
        })
    }
    !myRes.body ? nodeRes.end() :
        typeof myRes.body === 'string' ?
            nodeRes.end(myRes.body) : myRes.body(nodeRes);
}