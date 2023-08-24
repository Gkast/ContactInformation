import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/200";
import {Connection} from "mysql";
import {pageNotFoundResponse} from "../util/my-http/400";
import {mysqlQuery, xmlEscape} from "../util/utility";
import {React} from "../util/react";

export function contactPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Contact us"},
        <div class="center-container">
            <form method="post" action="/server/src/contact/contact" class="form-container">
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
    ))
}

export function contactEditPage(con: Connection): MyHttpListener {
    return (req, user) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (!id) {
            return Promise.resolve(pageNotFoundResponse());
        }
        return mysqlQuery(con,
            `SELECT *
             FROM contact_form_submits
             WHERE id = ?`,
            [id])
            .then(results => !results[0] ? pageNotFoundResponse() :
                pageHtmlResponse({user: user, title: "Edit Contact"},
                    <div class="center-container">
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
                ))
    }
}