import {Connection} from "mysql";
import {parseRequestCookies, plusMinutes, streamToString} from "../util/utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";
import {wrongCredentialsResponse} from "../util/my-http/responses/400";
import {redirectResponse} from "../util/my-http/responses/300";

export function loginPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Login", hasCaptcha: true}, `
<div class="center-container">
<form action="/login" method="post" class="login-register-container" data-captcha-form>
  <input type="text" placeholder="Username" name="username" required>
  <input type="password" placeholder="Password" name="password" required>
  <div class="login-action">
  <label class="flx-rw">Remember me:
  <input type="checkbox" name="remember-me" value="1">
  </label>
  <a href="/forgot-password">Forgot Password?</a>
  </div>
  <div class="g-recaptcha mr-btm" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
  <button type="submit" class="btn">Login</button>
</form>
</div>`))
}

export function loginReqList(con: Connection): MyHttpListener {
    return (req) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
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
                            const rememberMe = p['remember-me'] === '1';
                            const cookieString = randomstring.generate();
                            con.query(`INSERT INTO login_cookies (cookie_value, user_id, expires_interval_minutes,
                                                                  remember_me, ip_address,
                                                                  user_agent) VALUE (?, ?, ?, ?, ?, ?)`,
                                [cookieString, results[0].id, rememberMe ? 24 * 7 * 60 : 30, rememberMe ? 1 : 0,
                                    req.remoteAddr, req.headers["user-agent"]], err1 => reject(err1));
                            const rsp = redirectResponse('/home');
                            rsp.headers["set-cookie"] = [`loginid=${cookieString}${rememberMe ? `; Expires=${plusMinutes(new Date(), 60 * 24 * 7).toUTCString()}` : ''};Path=/;HttpOnly`];
                            resolve(rsp);
                        }
                    }
                }))
    })
}

export function logoutReqList(con: Connection): MyHttpListener {
    return (req) => new Promise((resolve, reject) => {
        const allCookiesMap = parseRequestCookies(req.headers.cookie);
        con.query(`UPDATE login_cookies
                   SET has_logged_out=?,
                       logout_time=?
                   WHERE cookie_value = ?`, [1, new Date(), allCookiesMap.get('loginid')],
            (err) => err ? reject(err) : resolve(redirectResponse('/home')));
    })
}

