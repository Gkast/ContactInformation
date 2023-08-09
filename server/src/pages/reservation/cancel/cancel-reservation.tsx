import {React} from "../../../util/react";
import {MyHttpListener} from "../../../util/my-http/my-http";
import {pageHtmlResponse} from "../../../util/my-http/responses/200";
import {xmlEscape} from "../../../util/utility";

export function cancelReservationPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Change Password"},
        <div class="center-container">
            <form method="POST" action="/cancel-reservation" class="login-register-container">
                <input type="hidden" name="token" value={xmlEscape(req.url.searchParams.get('token'))}/>
                <button type="submit" class="btn">Verify Cancellation</button>
            </form>
        </div>
    ))
}