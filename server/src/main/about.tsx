import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {React} from "../util/react";

export function aboutPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({
        title: 'About Us', user: user, contentHtml: <div>
            <h1>ABOUT US</h1>
            <p>test test test </p>
        </div>
    }))
}