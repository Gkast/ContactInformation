import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/successful-response";
import {React} from "../../util/react";

export function registerPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({
        user: user, title: "Register", hasCaptcha: true, contentHtml: <div class="center-container">
            <form action="/register" method="post" class="login-register-container">
                <input type="text" placeholder="Username" name="username" required/>
                <input type="password" placeholder="Password" name="password" required/>
                <input type="email" placeholder="Email" name="email" required/>
                <div class="g-recaptcha mr-btm" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
                <button type="submit" class="btn">Register</button>
            </form>
        </div>
    }))
}