import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {React} from "../util/react";

export function imgResizePage(): MyHttpListener {
    return async (req, user) => pageHtmlResponse({
        user: user, title: "Resize", contentHtml: <div class="center-container">
            <form method="get" action="/img-resize" class="form-container">
                <input type="url" placeholder="Image URL" name="url" required/>
                <input type="number" placeholder="Width" name="width" required/>
                <input type="number" placeholder="Height" name="height" required/>
                <button type="submit" class="btn">Resize</button>
            </form>
        </div>
    })
}