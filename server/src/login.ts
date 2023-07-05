import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";

export function loginRequestListener(con: Connection): MyHttpListener {
    return function (req) {
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`SELECT id
                           FROM users
                           WHERE username = (?)
                             AND password = (?)`, [p.username, p.password],
                    function (err, results) {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            if (results.length === 0) {
                                resolve({
                                    status: 401,
                                    headers: new Map(Object.entries({
                                        'content-type': 'text/plain'
                                    })),
                                    body: "wrong credentials"
                                } as MyHttpResponse);
                            } else {
                                const cookieString = randomstring.generate();
                                con.query(`INSERT INTO login_cookies (cookie_value, user_id) VALUE (?, ?)`,
                                    [cookieString, results[0].id],
                                    err1 => {
                                        reject(err1)
                                    });
                                resolve({
                                    status: 302,
                                    headers: new Map(Object.entries({
                                        'Location': '/home',
                                        'Set-Cookie': `loginid=${cookieString}`
                                    })),
                                } as MyHttpResponse);
                            }
                        }
                    });
            })
        });
    }
}

export function loginPageRequestListener(): MyHttpListener {
    return function (req, url) {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
</head>
<body>
<form action="/login" method="post" id="login-form">
  <label for="username">Username:</label>
  <input type="text" placeholder="Username" name="username" id="username" required>
  <label for="password">Password:</label>
  <input type="password" placeholder="Password" name="password" id="password" required>
  <button type="submit" id="submit-button">Login</button>
</form>
<a href="/home">Home</a>
</body>
</html>`
        });
    }
}
