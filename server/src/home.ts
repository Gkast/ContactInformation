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
    <link rel="stylesheet" type="text/css" href="../assets/css/home.css">
</head>
<body>${headerHtml(user)}
<h1>Home</h1>
${user ? `<p>Welcome ${user.username.toUpperCase()}</p>` : ''}
<ul>
    <li><a href="/about">About us</a></li>
    ${user ? `<li><a href="/contact">Contact</a></li>
    <li><a href="/dashboard">Dashboard</a></li>` : ``}
</ul>
</body>
</html>`
        });
    }
}