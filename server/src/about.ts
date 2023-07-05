import {MyHttpListener} from "./utility";

export function aboutPageRequestListener(): MyHttpListener {
    return function (req, url) {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ABOUT Information</title>
</head>
<body>
<h1>ABOUT US</h1>
<p>test test test </p>
<a href="/home">Home</a>
</body>
</html>`
        });
    }
}