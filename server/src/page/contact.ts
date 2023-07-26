import {streamToString, xmlEscape} from "../util/utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";
import {pageHtmlResponse, pageNotFoundResponse, redirectResponse} from "../util/my-http-responses";
import {MyHttpListener} from "../util/my-http";

export function contactPage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<div class="contact-form-wrapper">
    <form method="post" class="contact-form" action="http://localhost:3000/contact">
        <label for="first-name">Firstname:</label>
        <input type="text" placeholder="First Name" name="firstname" id="first-name" class="form-inputs" required>
        <label for="last-name">Lastname:</label>
        <input type="text" placeholder="Last Name" name="lastname" id="last-name" class="form-inputs" required>
        <label for="email">Email:</label>
        <input type="email" placeholder="Email" name="email" id="email" class="form-inputs" required>
        <label for="subject">Subject:</label>
        <input type="text" placeholder="Subject" name="subject" id="subject" class="form-inputs" required>
        <label for="message-area">Message:</label>
        <textarea placeholder="Write a message..." name="message" id="message-area" class="form-inputs" required></textarea>
        <button type="submit" id="submit-button" class="btn">Submit</button>
    </form>
</div>`
        return Promise.resolve(pageHtmlResponse({user: user, title: "Contact us"}, contentHtml));
    }
}

export function contactReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) =>
        streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO contact_form_submits (firstname, lastname, email, subject, message, user_id)
                           VALUES (?, ?, ?, ?, ?,
                                   ?)`, [p.firstname, p.lastname, p.email, p.subject, p.message, user.id],
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        smtpTransport.sendMail({
                            from: 'noreply@giorgokastanis.com',
                            to: p.email,
                            subject: typeof p.subject === 'string' ? p.subject : p.subject[0],
                            text: 'Contact form message: \n\n' + p.message + 'Thank you for submitting'
                        }, (error) => {
                            if (error) {
                                reject(error);
                            } else {
                                const contentHtml = `
<h1>Successful Submission</h1>
<a href="/home" >Home</a>`;
                                resolve(pageHtmlResponse({user: user, title: "Successful Submission"}, contentHtml));
                            }
                        });
                    });
            })
        })
}

export function contactDeleteReqList(con: Connection): MyHttpListener {
    return (req) =>
        new Promise((resolve, reject) => {
            const id = parseInt(req.url.pathname.split('/')[2], 10);
            if (id) {
                con.query("DELETE FROM contact_form_submits WHERE id=?", [id], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(redirectResponse('/contact-list'))
                    }
                })
            }
        })
}

export function contactEditPage(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            const id = parseInt(req.url.pathname.split('/')[2], 10);
            if (!id) {
                resolve(pageNotFoundResponse());
                return;
            }
            con.query("SELECT * FROM contact_form_submits WHERE id=?", [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const row = results[0];
                    if (!row) {
                        resolve(pageNotFoundResponse());
                        return;
                    }
                    const contentHtml = `
<div class="contact-form-wrapper">
    <form method="post" class="contact-form" action="/contact-list/${row.id}">
        <label for="first-name">First Name:</label>
        <input type="text" placeholder="First Name" name="firstname" id="first-name" class="form-inputs" required value="${xmlEscape(row.firstname)}">
        <label for="last-name">Last Name:</label>
        <input type="text" placeholder="Last Name" name="lastname" id="last-name" class="form-inputs" required value="${xmlEscape(row.lastname)}">
        <label for="email">Email:</label>
        <input type="email" placeholder="Email" name="email" id="email" class="form-inputs" required value="${xmlEscape(row.email)}">
        <label for="subject">Subject:</label>
        <input type="text" placeholder="Subject" name="subject" id="subject" class="form-inputs" required value="${xmlEscape(row.subject)}">
        <label for="message-area">Message:</label>
        <textarea placeholder="Write a message..." name="message" id="message-area" class="form-inputs" required>${xmlEscape(row.message)}</textarea>
        <button type="submit" class="btn">Submit</button>
    </form>
</div>`
                    resolve(pageHtmlResponse({user: user, title: "Edit Contact"}, contentHtml));
                }
            })
        })
}

export function contactEditReqList(con: Connection): MyHttpListener {
    return (req) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (!id) {
            return Promise.resolve(pageNotFoundResponse());
        }
        return streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) => {
                con.query(`UPDATE contact_form_submits
                           SET firstname=?,
                               lastname=?,
                               email=?,
                               subject=?,
                               message=?
                           WHERE id = ?`, [p.firstname, p.lastname, p.email, p.subject, p.message, id],
                    (err) => {
                        if (err != null) {
                            reject(err)
                        } else {
                            resolve(redirectResponse('/contact-list'));
                        }
                    });
            })
        });
    }
}

