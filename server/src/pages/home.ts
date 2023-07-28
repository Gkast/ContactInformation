import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";

export function homePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Home"}, `
<div class="center-container">
    <div class="article-message">
        <h1>Home</h1>
        ${user ? `<span class="user">Welcome ${user.username}</span>` : ''}
    </div>
    <div class="ul-container">
        <ul class="nv-home-links">
            <li class="home-li li-tp-br">
                <a href="/about" class="no-underline"><span>About us</span></a>
            </li>
            <li class="home-li">
                <a href="/csv" class="no-underline"><span>Export CSV Test</span></a>
            </li>
            <li class="home-li">
                <a href="/csv-stream" class="no-underline"><span>Export CSV Stream Test</span></a>
            </li>
            <li class="home-li">
                <a href="/csv-stream-pipe" class="no-underline"><span>Export CSV Stream Pipe Test</span></a>
            </li>
            <li class="home-li">
                <a href="/hotel-details-page" class="no-underline"><span>Hotel Details</span></a>
            </li class="home-li">
            <li class="home-li">
                <a href="/img-resize-page" class="no-underline"><span>Image Resizer</span></a>
            </li>
            ${user ? `
            <li class="home-li">
                <a href="/contact" class="no-underline"><span>Contact</span></a>
            </li>
            <li class="home-li">
                <a href="/contact-list" class="no-underline"><span>Contact List</span></a>
            </li>
            <li class="home-li">
                <a href="/contact-list-stream" class="no-underline"><span>Contact List Stream</span></a>
            </li>
            <li class="home-li">
                <a href="/upload-file" class="no-underline"><span>Upload File</span></a>
            </li>
            <li class="home-li li-btm-br">
                <a href="/file-list" class="no-underline"><span>File List</span></a>
            </li>` : ``}
        </ul>
    </div>
</div>`));
}