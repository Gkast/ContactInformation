import {Connection} from "mysql";
import {parseRequestCookies, plusMinutes, streamToString} from "../util/utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {pageHtmlResponse, redirectResponse, wrongCredentialsResponse} from "../util/my-http-responses";
import {MyHttpListener} from "../util/my-http";

export function loginReqList(con: Connection): MyHttpListener {
    return (req) =>
        streamToString(req.body).then(bodyString => {
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
                                resolve(wrongCredentialsResponse());
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
                                const rsp = redirectResponse('/home');
                                rsp.headers.set('Set-Cookie', `loginid=${cookieString}${rememberMe ? `; Expires=${plusMinutes(new Date(), 60 * 24 * 7).toUTCString()}` : ''};Path=/;HttpOnly`);
                                resolve(rsp);
                            }
                        }
                    });
            })
        })
}

export function loginPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form action="/login" method="post" id="login-form" data-captcha-form="">
  <label for="username">Username:</label>
  <input type="text" placeholder="Username" name="username" id="username" required>
  <label for="password">Password:</label>
  <input type="password" placeholder="Password" name="password" id="password" required>
  <label for="remember_me">Remember me:</label>
  <input type="checkbox" name="remember_me" id="remember_me" value="1">
  <a href="/forgot-password">Forgot Password?</a>
  <div class="g-recaptcha" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
  <button type="submit" id="submit-button" class="btn">Login</button>
</form>`
        return Promise.resolve(pageHtmlResponse({user: user, title: "Login", hasCaptcha: true}, contentHtml));
    }
}

export function logoutReqList(con: Connection): MyHttpListener {
    return (req) =>
        new Promise((resolve, reject) => {
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
                        resolve(redirectResponse('/home'));
                    }
                });
        })
}