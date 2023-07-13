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
    <link rel="stylesheet" type="text/css" href="../assets/css/about.css">
</head>
<body>${headerHtml(user)}
<h1>ABOUT US</h1>
<p>test test test </p>
</body>
</html>`
        });
    }
}