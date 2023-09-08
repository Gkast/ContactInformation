import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {Pool} from "mysql";
import {pageNotFoundResponse} from "../util/my-http/responses/client-error-response";
import {mysqlQuery, xmlEscape} from "../util/util";
import {React} from "../util/react";

export function contactPage(): MyHttpListener {
    return async (req, user) => {
        return pageHtmlResponse({
            user: user, title: "Contact us", contentHtml: <div class="center-container">
                <form method="post" action="/contact" class="form-container">
                    <input type="text" placeholder="First Name" name="firstname" required/>
                    <input type="text" placeholder="Last Name" name="lastname" required/>
                    <input type="email" placeholder="Email" name="email" required/>
                    <input type="text" placeholder="Subject" name="subject" required/>
                    <textarea placeholder="Write a message..." name="message" required></textarea>
                    <div class="form-button-container">
                        <button type="submit" class="btn">Submit Contact Form</button>
                    </div>
                </form>
            </div>
        })
    }
}

export function contactEditPage(con: Pool): MyHttpListener {
    return async (req, user) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (!id) {
            return Promise.resolve(pageNotFoundResponse());
        }
        const results = await mysqlQuery(con,
            `SELECT *
             FROM contact_form_submits
             WHERE id = ?`,
            [id]);
        return !results[0] ? pageNotFoundResponse() :
            pageHtmlResponse({
                user: user, title: "Edit Contact", contentHtml: <div class="center-container">
                    <form method="post" action={"/contact-list/" + results[0].id} class="form-container">
                        <input type="text" placeholder="First Name" name="firstname" required
                               value={xmlEscape(results[0].firstname)}/>
                        <input type="text" placeholder="Last Name" name="lastname" required
                               value={xmlEscape(results[0].lastname)}/>
                        <input type="email" placeholder="Email" name="email" required
                               value={xmlEscape(results[0].email)}/>
                        <input type="text" placeholder="Subject" name="subject" required
                               value={xmlEscape(results[0].subject)}/>
                        <textarea placeholder="Write a message..." name="message" required>
                            {xmlEscape(results[0].message)}
                        </textarea>
                        <button type="submit" class="btn">Change Contact Form</button>
                    </form>
                </div>
            });
    }
}