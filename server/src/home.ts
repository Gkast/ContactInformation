import {MyHttpListener} from "./utility";

export function homeRequestListener(): MyHttpListener {
    return function (req, url) {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
</head>
<body>
<h1>Home</h1>
<p>Welcome</p>
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