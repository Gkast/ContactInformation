import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, parseRequestCookies, plusMinutes, streamToString} from "./utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {pageHtml, wrongCredentials} from "./page";

export function loginRequestListener(con: Connection): MyHttpListener {
    return (req) => {
        return streamToString(req.body).then(bodyString => {
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
                                resolve(wrongCredentials());
                            } else {
                                const rememberMe = p['remember_me'] === '1';
                                const cookieString = randomstring.generate();
                                con.query(`INSERT INTO login_cookies (cookie_value, user_id, expires_interval_minutes,
                                                                      remember_me, ip_address,
                                                                      user_agent) VALUE (?, ?, ?, ?, ?, ?)`,
                                    [cookieString, results[0].id, rememberMe ? 24 * 7 * 60 : 30, rememberMe ? 1 : 0,
                                        req.remoteAddr, req.headers["user-agent"]],
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
    return (req, user) => {
        const contentHtml = `
<form action="/login" method="post" id="login-form" data-captcha-form="">
  <label for="username">Username:</label>
  <input type="text" placeholder="Username" name="username" id="username" required>
  <label for="password">Password:</label>
  <input type="password" placeholder="Password" name="password" id="password" required>
  <label for="remember_me">Remember me:</label>
  <input type="checkbox" name="remember_me" id="remember_me" value="1">
  <div class="g-recaptcha" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
  <button type="submit" id="submit-button">Login</button>
</form>`
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: pageHtml({user: user, title: "Login", hasCaptcha: true}, contentHtml)
        });
    }
}

export function logoutRequestListener(con: Connection): MyHttpListener {
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