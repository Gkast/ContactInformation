import {Connection} from "mysql";
import {streamToString} from "../util/utility";
import * as querystring from "querystring";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";

export function registerPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Register", hasCaptcha: true}, `
<div class="center-container">
<form action="/register" method="post" class="login-register-container">
    <input type="text" placeholder="Username" name="username" required>
    <input type="password" placeholder="Password" name="password" required>
    <input type="email" placeholder="Email" name="email" required>
    <div class="g-recaptcha mr-btm" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
    <button type="submit" class="btn">Register</button>
</form>
</div>`));
}

export function registerReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) =>
                con.query(`INSERT INTO users (username, password, email)
                           VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                    err => err? reject(err) : resolve(pageHtmlResponse({user: user, title: "Successful Registration"}, `
<h1>Successful Registration</h1>
<a href="/home" class="no-underline">
    <button class="btn">Home</button>
</a>`))
                ));
        });
}