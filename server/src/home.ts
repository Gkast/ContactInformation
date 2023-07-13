import {MyHttpListener} from "./utility";
import {pageHtml} from "./page";

export function homeRequestListener(): MyHttpListener {
    return (req, url, user) => {
        const contentHtml = `
<h1>Home</h1>
${user ? `<p>Welcome ${user.username.toUpperCase()}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    ${user ? `<li><a href="/contact">Contact</a></li>
                <li><a href="/dashboard">Dashboard</a></li>` : ``}
</ul>`
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: pageHtml("Home", user, contentHtml)
        });
    }
}