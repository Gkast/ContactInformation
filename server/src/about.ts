import {MyHttpListener} from "./utility";
import {headerHtml} from "./header";

export function aboutPageRequestListener(): MyHttpListener {
    return (req, url, user) => {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ABOUT Information</title>
</head>
<body>` + headerHtml(user) + `
<h1>ABOUT US</h1>
<p>test test test </p>
<a href="/home">Home</a>
</body>
</html>`
        });
    }
}