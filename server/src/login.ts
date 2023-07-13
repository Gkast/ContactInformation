import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, parseRequestCookies, plusMinutes, streamToString} from "./utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {headerHtml} from "./header";

export function loginRequestListener(con: Connection): MyHttpListener {
    return (req) => {
        return streamToString(req).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) => {
                con.query(`SELECT id
                           FROM users
                           WHERE username = (?)
                             AND password = (?)`, [p.username, p.password],
                    (err, results) => {
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
                                const rememberMe = p['remember_me'] === '1';
                                const cookieString = randomstring.generate();
                                con.query(`INSERT INTO login_cookies (cookie_value, user_id, expires_interval_minutes, remember_me) VALUE (?, ?, ?, ?)`,
                                    [cookieString, results[0].id, rememberMe ? 24 * 7 * 60 : 30, rememberMe ? 1 : 0],
                                    err1 => {
                                        reject(err1)
                                    });
                                resolve({
                                    status: 302,
                                    headers: new Map(Object.entries({
                                        'Location': '/home',
                                        'Set-Cookie': `loginid=${cookieString}${rememberMe ? `; Expires=${plusMinutes(new Date(), 60 * 24 * 7).toUTCString()}` : ''};Path=/;HttpOnly`
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
    return (req, url, user) => {
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" type="text/css" href="../assets/css/login.css">
</head>
<body>${headerHtml(user)}
<form action="/login" method="post" id="login-form">
  <label for="username">Username:</label>
  <input type="text" placeholder="Username" name="username" id="username" required>
  <label for="password">Password:</label>
  <input type="password" placeholder="Password" name="password" id="password" required>
  <label for="remember_me">Remember me:</label>
  <input type="checkbox" name="remember_me" id="remember_me" value="1">
  <button type="submit" id="submit-button">Login</button>
</form>
</body>
</html>`
        });
    }
}

export function logout(con: Connection): MyHttpListener {
    return (req) => {
        return new Promise((resolve, reject) => {
            const allCookiesMap = parseRequestCookies(req.headers.cookie);
            con.query(`UPDATE login_cookies
                       SET has_logged_out=?,
                           logout_time=?
                       WHERE cookie_value = ?`, [1, new Date(), allCookiesMap.get('loginid')],
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve({
                            status: 302,
                            headers: new Map(Object.entries({'Location': '/home'}))
                        } as MyHttpResponse)
                    }
                });
        })
    }
}