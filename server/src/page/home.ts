import {pageHtml} from "./skeleton-page/page";
import {MyHttpListener} from "../util/my-http";

export function homePage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<h1>Home</h1>
${user ? `<p>Welcome ${user.username.toUpperCase()}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    <li><a href="/csv">Export CSV Test</a></li>
    <li><a href="/csv-stream">Export CSV Stream Test</a></li>
    <li><a href="/csv-stream-pipe">Export CSV Stream Pipe Test</a></li>
    <li><a href="/hotel-details-page">Hotel Details</a></li>
    ${user ? `<li><a href="/contact">Contact</a></li>
              <li><a href="/contact-list">Contact List</a></li>
              <li><a href="/upload">Upload File</a></li>
              <li><a href="/file-list" class="action-button">File List</a></li>` : ``}
</ul>`
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: pageHtml({user: user, title: "Home"}, contentHtml)
        });
    }
}