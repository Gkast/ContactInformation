import {streamToString, xmlEscape} from "../util/utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {MyHttpListener} from "../util/my-http";
import {skeletonHtmlPage} from "../util/html-snippets";
import {pageHtmlResponse} from "../util/page-responses";

export function forgotPasswordPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form method="POST" action="/token-generator">
    <input type="text" placeholder="Enter Username" name="username">
    <button type="submit">Send Recovery Token</button>
</form>`;
        return Promise.resolve(pageHtmlResponse({user: user, title: "Forgot Password"}, contentHtml))
    }
}

export function recoveryTokenVerificationPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form method="get" action="/change-password">
    <input type="text" placeholder="Enter Token" name="token">        
    <button type="submit">Verify Token</button>
</form>`;
        return Promise.resolve({
            headers: new Map(Object.entries({
                "Content-Type": "text/html"
            })),
            body: skeletonHtmlPage({
                title: "Token Verification",
            }, contentHtml)
        })
    }
}

export function changePasswordPage(): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            const token = req.url.searchParams.get('token');
            const contentHtml = `
<form method="POST" action="/change-password">
    <input type="password" placeholder="Enter Password" name="password">            
    <input type="hidden" name="token" value="${xmlEscape(token)}">         
    <button type="submit">Change Password</button>   
</form>`;
            resolve(pageHtmlResponse({user: user, title: "Change Password"}, contentHtml))
        })
}

export function changePassword(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) => {
            con.query(`UPDATE users
                       SET password = ?
                       WHERE id = (SELECT user_id
                                   FROM recovery_tokens
                                   WHERE token_value = ?
                                     AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`,
                [p.password, p.token],
                (err, results, fields) => {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        if (results.affectedRows > 0) {
                            resolve(pageHtmlResponse({user: user, title: "Success"}, `<h1>Password Changed</h1>`))
                        } else {
                            resolve(pageHtmlResponse({user: user, title: "Token Expired"}, `<h1>Token Expired</h1>`))
                        }
                    }
                })
        })
    })
}