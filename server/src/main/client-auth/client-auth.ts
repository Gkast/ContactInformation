import {Pool} from "mysql";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {mysqlQuery, parseRequestCookies, plusMinutes, streamToString} from "../../util/util";
import {redirectResponse} from "../../util/my-http/responses/redirect-response";
import * as querystring from "querystring";
import {wrongCredentialsResponse} from "../../util/my-http/responses/client-error-response";
import * as randomstring from "randomstring";
import {Transporter} from "nodemailer";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

export function loginReqList(con: Pool): MyHttpListener {
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        const results = await mysqlQuery(con,
            `SELECT id
             FROM users
             WHERE username = ?
               AND password = ?`,
            [p.username, p.password]);
        if (results.length === 0) {
            return wrongCredentialsResponse();
        } else {
            const rememberMe = p['remember-me'] === '1';
            const cookieString = randomstring.generate();
            await mysqlQuery(con,
                `INSERT INTO login_cookies (cookie_value, user_id, expires_interval_minutes,
                                            remember_me, ip_address,
                                            user_agent) VALUE (?, ?, ?, ?, ?, ?)`,
                [cookieString, results[0].id, rememberMe ? 24 * 7 * 60 : 30, rememberMe ? 1 : 0,
                    req.remoteAddr, req.headers["user-agent"]])

            const rsp = redirectResponse('/home');
            rsp.headers["set-cookie"] = [`loginid=${cookieString}${rememberMe ? `; Expires=${plusMinutes(new Date(), 60 * 24 * 7).toUTCString()}` : ''};Path=/;HttpOnly`];
            return rsp;
        }
    }
}

export function logoutReqList(con: Pool): MyHttpListener {
    return async (req) => {
        const allCookiesMap = parseRequestCookies(req.headers.cookie);
        await mysqlQuery(con,
            `UPDATE login_cookies
             SET has_logged_out=?,
                 logout_time=?
             WHERE cookie_value = ?`, [1, new Date(), allCookiesMap.get('loginid')]);
        return redirectResponse('/home');
    }
}

export function recoveryTokenGeneratorReqList(con: Pool, smtpTransport:  Transporter<SMTPTransport.SentMessageInfo>): MyHttpListener {
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        const results = await mysqlQuery(con,
            `SELECT id, email
             FROM users
             WHERE username = ?`, [p.username]);
        if (results.length === 0) {
            return wrongCredentialsResponse();
        }
        const recoveryToken = randomstring.generate({
            length: 6,
            charset: "alphanumeric",
            capitalization: "lowercase"
        });
        await mysqlQuery(con,
            `INSERT INTO recovery_tokens (token_value, user_id, ip_address, user_agent)
                 VALUE (?, ?, ?, ?)`, [recoveryToken, results[0].id, req.remoteAddr,
                req.headers["user-agent"]]);
        await smtpTransport.sendMail({
            from: 'noreply@giorgokastanis.com',
            to: results[0].email,
            subject: 'Recovery Token',
            text: 'Your Recovery Token: ' + recoveryToken + '\n\nExpires in 30 minutes.'
        })
        return redirectResponse('/token-verify');
    };
}

export function registerReqList(con: Pool): MyHttpListener {
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        await mysqlQuery(con,
            `INSERT INTO users (username, password, email)
             VALUES (?, ?, ?)`,
            [p.username, p.password, p.email]);
        return pageHtmlResponse({
            user: user, title: "Successful Registration", contentHtml: `
    <h1>Successful Registration</h1>
    <a href="/home" class="no-underline">
        <button class="btn">Home</button>
    </a>`
        });
    };
}

export function changePasswordReqList(con: Pool): MyHttpListener {
    return async (req, user) => {
        let bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        let results = await mysqlQuery(con,
            `UPDATE users
             SET password = ?
             WHERE id = (SELECT user_id
                         FROM recovery_tokens
                         WHERE token_value = ?
                           AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`,
            [p.password, p.token]);
        return results['affectedRows'] > 0 ?
            pageHtmlResponse({user: user, title: "Success", contentHtml: `<h1>Password Changed</h1>`}) :
            pageHtmlResponse({user: user, title: "Token Expired", contentHtml: `<h1>Token Expired</h1>`});
    };
}