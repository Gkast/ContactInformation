import {MyHttpListener} from "../util/my-http/my-http";
import * as sharp from "sharp";
import * as https from "https";
import {pageHtmlResponse, PageResponseStream} from "../util/my-http/responses/200";

export function imgResizePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Resize"}, `
<div>
    <form method="get" action="/img-resize">
        <input type="url" placeholder="Image URL" name="url" required>
        <input type="number" placeholder="Width" name="width" required>
        <input type="number" placeholder="Height" name="height" required>
        <button type="submit" class="btn">Resize</button>
    </form>
</div>`))
}

export function imgResizeReqList(): MyHttpListener {
    return (req, user) => {
        const url = decodeURIComponent(req.url.searchParams.get('url'));
        const width = decodeURIComponent(req.url.searchParams.get('width')) ?
            parseInt(req.url.searchParams.get('width')) : 200;
        const height = decodeURIComponent(req.url.searchParams.get('height')) ?
            parseInt(req.url.searchParams.get('height')) : 200;
        const imgResizer = sharp().resize(width, height, {fit: "contain",}).jpeg();
        return Promise.resolve(PageResponseStream('image/jpeg', res =>
            https.get(url, res1 => res1.pipe(imgResizer).pipe(res))
        ));
    }
}