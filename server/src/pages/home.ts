import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";

export function homePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Home"}, `
<h1>Home</h1>
${user ? `<p>Welcome ${user.username.toUpperCase()}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    <li><a href="/csv">Export CSV Test</a></li>
    <li><a href="/csv-stream">Export CSV Stream Test</a></li>
    <li><a href="/csv-stream-pipe">Export CSV Stream Pipe Test</a></li>
    <li><a href="/hotel-details-page">Hotel Details</a></li>
    <li><a href="/img-resize-page">Image Resizer</a></li>
    ${user ? `<li><a href="/contact">Contact</a></li>
              <li><a href="/contact-list">Contact List</a></li>
              <li><a href="/contact-list-stream">Contact List Stream</a></li>
              <li><a href="/upload-file">Upload File</a></li>
              <li><a href="/file-list">File List</a></li>` : ``}
</ul>`));
}