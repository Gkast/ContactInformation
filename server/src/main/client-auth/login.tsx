import {MyHttpListener} from "../../util/my-http/http-handler";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {React} from "../../util/react";

export function loginPage(): MyHttpListener {
    return async (req, user) => pageHtmlResponse({
        user: user, title: "Login", hasCaptcha: true, contentHtml: <div class="center-container">
            <form action="/login" method="post" class="login-register-container" data-captcha-form="">
                <input type="text" placeholder="Username" name="username" required/>
                <input type="password" placeholder="Password" name="password" required/>
                <div class="login-action">
                    <label class="flx-rw">Remember me:
                        <input type="checkbox" name="remember-me" value="1"/>
                    </label>
                    <a href="/forgot-password">Forgot Password?</a>
                </div>
                <div class="g-recaptcha mr-btm" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
                <button type="submit" class="btn">Login</button>
            </form>
        </div>
    })
}