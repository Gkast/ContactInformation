import {streamToString, xmlEscape} from "../util/utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";

export function forgotPasswordPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Forgot Password"}, `
<div class="center-container">
<form method="POST" action="/token-generator" class="login-register-container">
    <input type="text" placeholder="Enter Username" name="username">
    <button type="submit" class="btn">Send Recovery Token</button>
</form>
</div`))
}

export function recoveryTokenVerificationPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Token Verification"}, `
<div class="center-container">
<form method="get" action="/change-password" class="login-register-container">
    <input type="text" placeholder="Enter Token" name="token">        
    <button type="submit" class="btn">Verify Token</button>
</form>
</div>`))
}

export function changePasswordPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Change Password"}, `
<div class="center-container">
<form method="POST" action="/change-password" class="login-register-container">
    <input type="password" placeholder="Enter Password" name="password">            
    <input type="hidden" name="token" value="${xmlEscape(req.url.searchParams.get('token'))}">         
    <button type="submit" class="btn">Change Password</button>   
</form>
</div>`));
}

export function changePasswordReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
            con.query(`UPDATE users
                       SET password = ?
                       WHERE id = (SELECT user_id
                                   FROM recovery_tokens
                                   WHERE token_value = ?
                                     AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`,
                [p.password, p.token],
                (err, results, fields) => err ? reject(err) : results.affectedRows > 0 ?
                        resolve(pageHtmlResponse({user: user, title: "Success"}, `<h1>Password Changed</h1>`)) :
                        resolve(pageHtmlResponse({user: user, title: "Token Expired"}, `<h1>Token Expired</h1>`))
            ));
    });
}