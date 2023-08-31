import {mysqlQuery, streamToString} from "../util/util";
import * as querystring from "querystring";
import {Pool} from "mysql";
import {Transporter} from "nodemailer";
import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {pageNotFoundResponse} from "../util/my-http/responses/client-error-response";
import {redirectResponse} from "../util/my-http/responses/redirect-response";

export function contactReqList(con: Pool, smtpTransport: Transporter): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `INSERT INTO contact_form_submits (firstname, lastname, email, subject, message, user_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [p.firstname, p.lastname, p.email, p.subject, p.message, user.id])
            .then(results => new Promise((resolve, reject) => smtpTransport.sendMail({
                from: 'noreply@giorgokastanis.com',
                to: p.email,
                subject: typeof p.subject === 'string' ? p.subject : p.subject[0],
                text: 'Contact form message: \n\n' + p.message + '\n\nThank you for submitting'
            }, (err) =>
                err ? reject(err) :
                    resolve(pageHtmlResponse({
                        user: user, title: "Successful Submission", contentHtml: `
    <h1>Successful Submission</h1>
    <p>Your Contact ID:${results['insertId']}</p>
    <a href="/home" class="no-underline">
        <button class="btn">Home</button>
    </a>`
                    })))))
    })
}

export function contactDeleteReqList(con: Pool): MyHttpListener {
    return (req) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        return mysqlQuery(con, `DELETE
                                FROM contact_form_submits
                                WHERE id = ?`, [id])
            .then(results => redirectResponse('/contact-list'))
    }
}

export function contactEditReqList(con: Pool): MyHttpListener {
    return (req, user) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        return !id ? Promise.resolve(pageNotFoundResponse()) : streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return mysqlQuery(con,
                `UPDATE contact_form_submits
                 SET firstname=?,
                     lastname=?,
                     email=?,
                     subject=?,
                     message=?
                 WHERE id = ?`,
                [p.firstname, p.lastname, p.email, p.subject, p.message, id])
                .then(results => redirectResponse('/contact-list'))
        });
    }
}

