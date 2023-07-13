import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";
import {headerHtml} from "./header";

export function registerRequestListener(con: Connection): MyHttpListener {
    return (req, url, user) => {
        return streamToString(req).then(bodyString => {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO users (username, password, email)
                           VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                    (err) => {
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
    <link rel="stylesheet" type="text/css" href="../assets/css/successful-action.css">
<body>${headerHtml(user)}
<h1>Successful Registration</h1>
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
    return (req, url, user) => {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/register.css">
</head>
<body>${headerHtml(user)}
<form action="/register" method="post" id="register-form">
    <label for="username">Username:</label>
    <input type="text" placeholder="Username" name="username" id="username" required>
    <label for="password">Password:</label>
    <input type="password" placeholder="Password" name="password" id="password" required>
    <label for="email">Email:</label>
    <input type="email" placeholder="Email" name="email" id="email" required>
    <button type="submit" id="submit-button">Register</button>
</form>
</body>
</html>`
        });
    }
}