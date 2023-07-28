import {MyHttpListener} from "../util/my-http/my-http";

import {pageHtmlResponse} from "../util/my-http/responses/200";

export function aboutPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({title: 'About Us', user: user}, `
<h1>ABOUT US</h1>
<p>test test test </p>`))
}