import {pageHtml} from "./skeleton-page/page";
import {MyHttpListener} from "../util/my-http";

export function aboutPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<h1>ABOUT US</h1>
<p>test test test </p>`;
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: pageHtml({title: 'About us', user: user}, contentHtml)
        });
    }
}