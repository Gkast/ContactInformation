import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {React} from "../../util/react";

export function registerPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Register", hasCaptcha: true},
        <div class="center-container">
            <form action="/register" method="post" class="login-register-container">
                <input type="text" placeholder="Username" name="username" required/>
                <input type="password" placeholder="Password" name="password" required/>
                <ul class="requirement-list">
                    <li id="length">
                        <span>At least 8 characters length</span>
                    </li>
                    <li id="number">
                        <span>At least 1 number (0...9)</span>
                    </li>
                    <li id="lowercase">
                        <span>At least 1 lowercase letter (a...z)</span>
                    </li>
                    <li id="uppercase">
                        <span>At least 1 uppercase letter (A...Z)</span>
                    </li>
                    <li id="symbol">
                        <span>At least 1 special symbol (!...$)</span>
                    </li>
                </ul>
                <input type="email" placeholder="Email" name="email" required/>
                <div class="g-recaptcha mr-btm" data-sitekey="6LdbcC0nAAAAACAdqlzft43Ow4vEHkb7B-ZEFIIE"></div>
                <button type="submit" class="btn">Register</button>
            </form>
        </div>));
}