import {MyHttpListener} from "../util/my-http";
import {pageHtmlResponse} from "../util/my-http-responses";

export function aboutPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<h1>ABOUT US</h1>
<p>test test test </p>`;
        return Promise.resolve(pageHtmlResponse({title: 'About us', user: user}, contentHtml));
    }
}