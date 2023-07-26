import {Connection} from "mysql";
import {streamToString} from "../util/utility";
import * as querystring from "querystring";
import {MyHttpListener, MyHttpResponse} from "../util/my-http";
import {pageHtmlResponse} from "../util/my-http-responses";

export function registerReqList(con: Connection): MyHttpListener {
    return (req, user) =>
        streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO users (username, password, email)
                           VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            const contentHtml = `
<h1>Successful Registration</h1>
<a href="/home" class="no-underline"><button class="btn">Home</button></a>`;
                            resolve(pageHtmlResponse({user: user, title: "Successful Registration"}, contentHtml));
                        }
                    });
            })
        })
}

export function registerPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form action="/register" method="post" id="register-form">
    <label for="username">Username:</label>
    <input type="text" placeholder="Username" name="username" id="username" required>
    <label for="password">Password:</label>
    <input type="password" placeholder="Password" name="password" id="password" required>
    <label for="email">Email:</label>
    <input type="email" placeholder="Email" name="email" id="email" required>
    <div class="g-recaptcha" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
    <button type="submit" id="submit-button">Register</button>
</form>`
        return Promise.resolve(pageHtmlResponse({user: user, title: "Register", hasCaptcha: true}, contentHtml));
    }
}