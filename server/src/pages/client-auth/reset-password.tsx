import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {React} from "../../util/react";
import {xmlEscape} from "../../util/utility";

export function forgotPasswordPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Forgot Password"},
        <div class="center-container">
            <form method="POST" action="/token-generator" class="login-register-container">
                <input type="text" placeholder="Enter Username" name="username"/>
                <button type="submit" class="btn">Send Recovery Token</button>
            </form>
        </div>
    ))
}

export function recoveryTokenVerificationPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Token Verification"},
        <div class="center-container">
            <form method="get" action="/change-password" class="login-register-container">
                <input type="text" placeholder="Enter Token" name="token"/>
                <button type="submit" class="btn">Verify Token</button>
            </form>
        </div>
    ))
}

export function changePasswordPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Change Password"},
        <div class="center-container">
            <form method="POST" action="/change-password" class="login-register-container">
                <input type="password" placeholder="Enter Password" name="password"/>
                <input type="hidden" name="token" value={xmlEscape(req.url.searchParams.get('token'))}/>
                <button type="submit" class="btn">Change Password</button>
            </form>
        </div>
    ))
}