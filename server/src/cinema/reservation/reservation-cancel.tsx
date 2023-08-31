import {React} from "../../util/react";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {xmlEscape} from "../../util/util";

export function cancelReservationPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({
            user: user, title: "Change Password", contentHtml: <div class="center-container">
                <form method="POST" action="/server/src/cinema/reservation/reservation-cancel" class="login-register-container">
                    <input type="hidden" name="token" value={xmlEscape(req.url.searchParams.get('token'))}/>
                    <button type="submit" class="btn">Verify Cancellation</button>
                </form>
            </div>
        }
    ))
}