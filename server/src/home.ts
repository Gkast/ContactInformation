import {MyHttpListener} from "./utility";
import {headerHtml} from "./header";

export function homeRequestListener(): MyHttpListener {
    return (req, url, user) => {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
</head>
<body>` + headerHtml(user) + `
<h1>Home</h1>
${user ? `<p>Welcome ${user.username}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    <li><a href="/contact">Contact</a></li>
    <li><a href="/login">Login</a></li>
    <li><a href="/register">Register</a></li>
    <li><a href="/form-dashboard">Form Dashboard</a></li>
</ul>
</body>
</html>`
        });
    }
}