import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {mysqlQuery, parseRequestCookies, plusMinutes, streamToString} from "../../util/utility";
import {redirectResponse} from "../../util/my-http/redirect-response";
import * as querystring from "querystring";
import {pageNotFoundResponse, wrongCredentialsResponse} from "../../util/my-http/client-error-response";
import * as randomstring from "randomstring";
import {Transporter} from "nodemailer";
import {pageHtmlResponse} from "../../util/my-http/successful-response";

export function loginReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `SELECT id
             FROM users
             WHERE username = ?
               AND password = ?`,
            [p.username, p.password])
            .then(results => {
                if (results.length === 0) {
                    return wrongCredentialsResponse();
                } else {
                    const rememberMe = p['remember-me'] === '1';
                    const cookieString = randomstring.generate();
                    return mysqlQuery(con,
                        `INSERT INTO login_cookies (cookie_value, user_id, expires_interval_minutes,
                                                    remember_me, ip_address,
                                                    user_agent) VALUE (?, ?, ?, ?, ?, ?)`,
                        [cookieString, results[0].id, rememberMe ? 24 * 7 * 60 : 30, rememberMe ? 1 : 0,
                            req.remoteAddr, req.headers["user-agent"]])
                        .then(value => {
                            const rsp = redirectResponse('/home');
                            rsp.headers["set-cookie"] = [`loginid=${cookieString}${rememberMe ? `; Expires=${plusMinutes(new Date(), 60 * 24 * 7).toUTCString()}` : ''};Path=/;HttpOnly`];
                            return rsp;
                        })
                }
            })
    })
}

export function logoutReqList(con: Connection): MyHttpListener {
    return (req) => {
        const allCookiesMap = parseRequestCookies(req.headers.cookie);
        return mysqlQuery(con,
            `UPDATE login_cookies
             SET has_logged_out=?,
                 logout_time=?
             WHERE cookie_value = ?`, [1, new Date(), allCookiesMap.get('loginid')])
            .then(value => redirectResponse('/home'))
    }
}

export function recoveryTokenGeneratorReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `SELECT id, email
             FROM users
             WHERE username = ?`, [p.username])
            .then(results => {
                if (results.length === 0) {
                    return wrongCredentialsResponse()
                }
                const recoveryToken = randomstring.generate({
                    length: 6,
                    charset: "alphanumeric",
                    capitalization: "lowercase"
                });
                return mysqlQuery(con,
                    `INSERT INTO recovery_tokens (token_value, user_id, ip_address, user_agent)
                         VALUE (?, ?, ?, ?)`, [recoveryToken, results[0].id, req.remoteAddr,
                        req.headers["user-agent"]])
                    .then(value => new Promise((resolve, reject) => smtpTransport.sendMail({
                        from: 'noreply@giorgokastanis.com',
                        to: results[0].email,
                        subject: 'Recovery Token',
                        text: 'Your Recovery Token: ' + recoveryToken + '\n\nExpires in 30 minutes.'
                    }, error => error ? reject(error) : resolve(redirectResponse('/token-verify')))))
            })
    });
}

export function registerReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `INSERT INTO users (username, password, email)
             VALUES (?, ?, ?)`,
            [p.username, p.password, p.email])
            .then(result => pageHtmlResponse({
                user: user, title: "Successful Registration", contentHtml: `
<h1>Successful Registration</h1>
<a href="/home" class="no-underline">
    <button class="btn">Home</button>
</a>`
            }))
    });
}

export function changePasswordReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `UPDATE users
             SET password = ?
             WHERE id = (SELECT user_id
                         FROM recovery_tokens
                         WHERE token_value = ?
                           AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`,
            [p.password, p.token])
            .then(results => results['affectedRows'] > 0 ?
                pageHtmlResponse({user: user, title: "Success", contentHtml: `<h1>Password Changed</h1>`}) :
                pageHtmlResponse({user: user, title: "Token Expired", contentHtml: `<h1>Token Expired</h1>`}))
    });
}