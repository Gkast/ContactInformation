import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {React} from "../../util/react";

export function aboutPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({title: 'About Us', user: user},
        <div>
            <h1>ABOUT US</h1>
            <p>test test test </p>
        </div>
    ))
}