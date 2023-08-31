import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/successful-response";
import {React} from "../util/react";

export function imgResizePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({
        user: user, title: "Resize", contentHtml: <div class="center-container">
            <form method="get" action="/img-resize" class="form-container">
                <input type="url" placeholder="Image URL" name="url" required/>
                <input type="number" placeholder="Width" name="width" required/>
                <input type="number" placeholder="Height" name="height" required/>
                <button type="submit" class="btn">Resize</button>
            </form>
        </div>
    }))
}