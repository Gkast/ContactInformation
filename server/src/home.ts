import {MyHttpListener, MyHttpResponse, pageNotFound} from "./utility";
import * as fs from "fs";

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