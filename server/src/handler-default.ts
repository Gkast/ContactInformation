import * as fs from "fs";
import {MyHttpListener, MyHttpResponse, pageNotFound} from "./utility";

export function staticFileListener(mimetypes: Map<string, string>): MyHttpListener {
    return function (req, url) {
        return fs.promises.stat('..' + url.pathname.toLowerCase()).then(result => {
            if (result.isFile()) {
                const ext = url.pathname.split('.').pop().toLowerCase();
                return {
                    headers: new Map(Object.entries({'Content-Type': mimetypes.get(ext) || 'application/octet-stream'})),
                    body: res => fs.createReadStream('..' + url.pathname.toLowerCase()).pipe(res)
                } as MyHttpResponse;
            } else {
                return pageNotFound()
            }
        }).catch(pageNotFound);
    }
}

export function homeRequestListener(): MyHttpListener {
    return function (req, url) {
        return fs.promises.readFile("../templates/home.html").then(fileContents => {
            return {
                headers: new Map(Object.entries({'Content-Type': 'text/html'})),
                body: stream => stream.end(fileContents)
            } as MyHttpResponse;
        }).catch(pageNotFound);
    }
}

export function defaultListener(): MyHttpListener {
    return function (req, parsedUrl) {
        return fs.promises.readFile("../templates/" +
            (parsedUrl.pathname.endsWith('.html') ?
                parsedUrl.pathname : (parsedUrl.pathname + '.html')))
            .then(fileContents => {
                return {
                    headers: new Map(Object.entries({'Content-Type': 'text/html',})),
                    body: res => res.end(fileContents)
                } as MyHttpResponse;
            }).catch(pageNotFound);
    }
}


