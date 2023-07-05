import * as fs from "fs";
import {MyHttpListener, MyHttpResponse, pageNotFound} from "./utility";

export function defaultListener(): MyHttpListener {
    return function (req, url) {
        return fs.promises.readFile("../templates/" +
            (url.pathname.endsWith('.html') ?
                url.pathname : (url.pathname + '.html')))
            .then(fileContents => {
                return {
                    headers: new Map(Object.entries({'Content-Type': 'text/html',})),
                    body: res => res.end(fileContents)
                } as MyHttpResponse;
            }).catch(pageNotFound);
    }
}