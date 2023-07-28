import {streamToString, xmlEscape} from "../util/utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";
import {pageNotFoundResponse} from "../util/my-http/responses/400";
import {redirectResponse} from "../util/my-http/responses/300";

export function contactPage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Contact us"}, `
<div class="center-container">
    <form method="post" action="/contact" class="form-container">
        <input type="text" placeholder="First Name" name="firstname" required>
        <input type="text" placeholder="Last Name" name="lastname" required>
        <input type="email" placeholder="Email" name="email" required>
        <input type="text" placeholder="Subject" name="subject" required>
        <textarea placeholder="Write a message..." name="message" required></textarea>
        <div class="form-button-container">
            <button type="submit" class="btn">Submit Contact Form</button>
        </div>
    </form>
</div>`));
}

export function contactReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
            con.query(`INSERT INTO contact_form_submits (firstname, lastname, email, subject, message, user_id)
                       VALUES (?, ?, ?, ?, ?, ?)`,
                [p.firstname, p.lastname, p.email, p.subject, p.message, user.id],
                (err, results) =>
                    err ? reject(err) :
                        smtpTransport.sendMail({
                            from: 'noreply@giorgokastanis.com',
                            to: p.email,
                            subject: typeof p.subject === 'string' ? p.subject : p.subject[0],
                            text: 'Contact form message: \n\n' + p.message + 'Thank you for submitting'
                        }, (err) =>
                            err ? reject(err) :
                                resolve(pageHtmlResponse({user: user, title: "Successful Submission"}, `
    <h1>Successful Submission</h1>
    <p>Your Contact ID:${results.insertId}</p>
    <a href="/home" class="no-underline">
        <button class="btn">Home</button>
    </a>`)))));
    })
}

export function contactDeleteReqList(con: Connection): MyHttpListener {
    return (req) => new Promise((resolve, reject) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (id)
            con.query("DELETE FROM contact_form_submits WHERE id=?", [id], (err) =>
                err ? reject(err) : resolve(redirectResponse('/contact-list')))
    })
}

export function contactEditPage(con: Connection): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        !id ? resolve(pageNotFoundResponse()) :
            con.query("SELECT * FROM contact_form_submits WHERE id=?", [id], (err, results) =>
                err ? reject(err) : !results[0] ? resolve(pageNotFoundResponse()) :
                    resolve(pageHtmlResponse({user: user, title: "Edit Contact"}, `
<div class="center-container">
    <form method="post" action="/contact-list/${results[0].id}" class="form-container">
        <input type="text" placeholder="First Name" name="firstname" required value="${xmlEscape(results[0].firstname)}">
        <input type="text" placeholder="Last Name" name="lastname" required value="${xmlEscape(results[0].lastname)}">
        <input type="email" placeholder="Email" name="email" required value="${xmlEscape(results[0].email)}">
        <input type="text" placeholder="Subject" name="subject" required value="${xmlEscape(results[0].subject)}">
        <textarea placeholder="Write a message..." name="message" required>${xmlEscape(results[0].message)}</textarea>
        <button type="submit" class="btn">Change Contact Form</button>
    </form>
</div>`)))
    })
}

export function contactEditReqList(con: Connection): MyHttpListener {
    return (req) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        return !id ? Promise.resolve(pageNotFoundResponse()) : streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) =>
                con.query(`UPDATE contact_form_submits
                           SET firstname=?,
                               lastname=?,
                               email=?,
                               subject=?,
                               message=?
                           WHERE id = ?`, [p.firstname, p.lastname, p.email, p.subject, p.message, id], err =>
                    err != null ? reject(err) : resolve(redirectResponse('/contact-list'))));
        });
    }
}
