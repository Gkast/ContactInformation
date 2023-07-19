import {MyHttpListener} from "./utility";
import {pageHtml} from "./page";

export function homePage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<h1>Home</h1>
${user ? `<p>Welcome ${user.username.toUpperCase()}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    <li><a href="/csv">CSV</a></li>
    <li><a href="/csv-stream">CSV Stream</a></li>
    <li><a href="/csv-stream-pipe">CSV Stream Pipe</a></li>
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