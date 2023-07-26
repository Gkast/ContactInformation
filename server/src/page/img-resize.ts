import {MyHttpListener} from "../util/my-http";
import {pageHtmlResponse} from "../util/my-http-responses";
import * as sharp from "sharp";
import * as https from "https";

export function imgResizePage(): MyHttpListener {
    return (req, user) =>
        Promise.resolve(pageHtmlResponse({user: user, title: "Resize"}, `
<div class="contact-form-wrapper">
    <form method="get" class="contact-form" action="/img-resize">
        <input type="url" placeholder="Image URL" name="url" class="form-inputs" required>
        <input type="number" placeholder="Width" name="width" class="form-inputs" required>
        <input type="number" placeholder="Height" name="height" class="form-inputs" required>
        <button type="submit" id="submit-button" class="btn">Submit</button>
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

        return Promise.resolve({
            headers: new Map(Object.entries({
                "Content-Type": "image/jpeg"
            })),
            body: res => {
                https.get(url, res1 => {
                    res1.pipe(imgResizer).pipe(res)
                })
            }
        })
    }
}