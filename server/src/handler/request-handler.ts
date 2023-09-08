import {HttpRouter} from "../util/config/router-config";
import * as http from "http";
import {mimeType} from "../util/tools/mime-types";
import {withUserId} from "../auth/authentication";
import {getHttpStatusMessage} from "../util/my-http/http-status";
import {logger} from "../main";
import {MyHttpListener, myResToNodeRes, nodeReqToMyReq} from "../util/my-http/http-handler";
import {Pool} from "mysql";

export async function handleRequest(
    nodeReq: http.IncomingMessage,
    nodeRes: http.ServerResponse<http.IncomingMessage> & {
        req: http.IncomingMessage;
    },
    router: HttpRouter<MyHttpListener>,
    dbPool: Pool): Promise<void> {

    const myReq = nodeReqToMyReq(nodeReq);
    const parsedUrl = myReq.url;
    const handlerFound = router.find(nodeReq.method, parsedUrl.pathname.toLowerCase());

    if (!handlerFound || !handlerFound[0]) {
        nodeRes.statusCode = 405;
        nodeRes.setHeader('Content-Type', mimeType("pl"));
        nodeRes.end('Method not found')
        return;
    }

    try {
        const myHandler = handlerFound[0];
        const wrappedHandler = withUserId(dbPool, myHandler);
        const myRes = await wrappedHandler(myReq);
        myResToNodeRes(myRes, nodeRes);
    } catch (err) {
        logger.error(`Error occurred: 
Url: ${nodeReq.url} 
Headers: ${JSON.stringify(nodeReq.headers, null, 4)} 
Error Message: ${err.message} 
Error stack: ${err.stack}`, {
            url: nodeReq.url,
            headers: nodeReq.headers,
            message: err.message,
            stack: err.stack
        });
        nodeRes.statusCode = 500;
        nodeRes.statusMessage = getHttpStatusMessage(nodeRes.statusCode);
        nodeRes.setHeader('Content-Type', mimeType("pl"));
        nodeRes.end('An unexpected error occurred');
    }
}