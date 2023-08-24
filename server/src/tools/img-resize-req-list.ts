import {MyHttpListener} from "../util/my-http/my-http";
import * as sharp from "sharp";
import * as https from "https";
import {pageResponseStream} from "../util/my-http/200";

export function imgResizeReqList(): MyHttpListener {
    return (req) => {
        const url = decodeURIComponent(req.url.searchParams.get('url'));
        const width = decodeURIComponent(req.url.searchParams.get('width')) ?
            parseInt(req.url.searchParams.get('width')) : 200;
        const height = decodeURIComponent(req.url.searchParams.get('height')) ?
            parseInt(req.url.searchParams.get('height')) : 200;
        const imgResizer = sharp().resize(width, height, {fit: "contain",}).jpeg();
        return Promise.resolve(pageResponseStream('image/jpeg', res =>
            https.get(url, res1 => res1.pipe(imgResizer).pipe(res))
        ));
    }
}