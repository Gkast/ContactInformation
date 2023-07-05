import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";

export function registerRequestListener(con: Connection): MyHttpListener {
    return function (req, url) {
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO users (username, password, email)
                           VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                    function (err) {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            resolve({
                                headers: new Map(Object.entries({
                                    'content-type': 'text/html'
                                })),
                                body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Success</title></head>
<body>
<h1>Successful Registration</h1>
<a href="/home">Home</a>
</body>
</html>`
                            } as MyHttpResponse);
                        }
                    });
            })
        });
    }
}

export function registerPageRequestListener(): MyHttpListener {
    return function (req, url) {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register</title>
</head>
<body>
<form action="/register" method="post" id="register-form">
    <label for="username">Username:</label>
    <input type="text" placeholder="Username" name="username" id="username" required>
    <label for="password">Password:</label>
    <input type="password" placeholder="Password" name="password" id="password" required>
    <label for="email">Email:</label>
    <input type="email" placeholder="Email" name="email" id="email" required>
    <button type="submit" id="submit-button">Register</button>
</form>
<a href="/home">Home</a>
</body>
</html>`
        });
    }
}