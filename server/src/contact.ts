import {MyHttpListener, MyHttpResponse, pageNotFound, streamToString} from "./utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";

const successSubmissionFormHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Success</title></head>
<body>
<h1>Successful Registration</h1>
<a href="/home">Home</a>
</body>
</html>`;

export function contactusRedirectListener(): MyHttpListener {
    return function (req, url) {
        return Promise.resolve({
            status: 302,
            headers: new Map(Object.entries({"Location": "/contact"}))
        })
    }
}

export function contactRequestListener(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return function (req, url) {
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO contact_form_submits (firstname, lastname, email, subject, message)
                           VALUES (?, ?, ?, ?, ?)`, [p.firstname, p.lastname, p.email, p.subject, p.message],
                    function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        smtpTransport.sendMail({
                            from: 'noreply@giorgokastanis.com',
                            to: p.email,
                            subject: typeof p.subject === 'string' ? p.subject : p.subject[0],
                            text: 'Contact form message: \n\n' + p.message
                        }, function (error, info) {
                            if (error) {
                                reject(error);
                            } else {
                                resolve({
                                    headers: new Map(Object.entries({
                                        'content-type': 'text/html'
                                    })),
                                    body: successSubmissionFormHtml
                                } as MyHttpResponse)
                            }
                        });
                    });
            })
        });
    }
}

export function contactDeleteListener(con: Connection): MyHttpListener {
    return function (req, url) {
        return new Promise((resolve, reject) => {
            const id = parseInt(url.pathname.split('/')[2], 10);
            if (id) {
                con.query("DELETE FROM contact_form_submits WHERE id=?", [id], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            status: 302,
                            headers: new Map(Object.entries({'Location': '/form-dashboard'}))
                        })
                    }
                })
            }
        })

    }
}

export function contactEditPageListener(con: Connection): MyHttpListener {
    return function (req, url) {
        return new Promise((resolve, reject) => {
            const id = parseInt(url.pathname.split('/')[2], 10);
            if (!id) {
                resolve(pageNotFound());
                return;
            }
            con.query("SELECT * FROM contact_form_submits WHERE id=?", [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const row = results[0];
                    if (!row) {
                        resolve(pageNotFound());
                        return;
                    }
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Contact Information</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/contact-form.css">
</head>
<body>
<form method="post" id="contact-form" action="/form-dashboard/${row.id}">
    <label for="first-name">First Name:</label>
    <input type="text" placeholder="First Name" name="firstname" id="first-name" class="form-inputs" required value="${row.firstname}">

    <label for="last-name">Last Name:</label>
    <input type="text" placeholder="Last Name" name="lastname" id="last-name" class="form-inputs" required value="${row.lastname}">

    <label for="email">Email:</label>
    <input type="email" placeholder="Email" name="email" id="email" class="form-inputs" required value="${row.email}">

    <label for="subject">Subject:</label>
    <input type="text" placeholder="Subject" name="subject" id="subject" class="form-inputs" required value="${row.subject}">

    <label for="message-area">Message:</label>
    <textarea placeholder="Write a message..." name="message" id="message-area" class="form-inputs" required>${row.message}</textarea>

    <button type="submit" id="submit-button">Submit</button>
    
    <a href="/home">Home</a>
</form>
<script src="../assets/js/contact-form.js"></script>
</body>
</html>`
                    })
                }
            })
        })
    }
}

export function contactUpdateListener(con: Connection): MyHttpListener {
    return function (req, url) {
        const id = parseInt(url.pathname.split('/')[2], 10);
        if (!id) {
            return Promise.resolve(pageNotFound());
        }
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) => {
                con.query(`UPDATE contact_form_submits
                           SET firstname=?,
                               lastname=?,
                               email=?,
                               subject=?,
                               message=?
                           WHERE id = ?`, [p.firstname, p.lastname, p.email, p.subject, p.message, id], (err, results) => {
                    if (err != null) {
                        reject(err)
                    } else {
                        resolve({
                            status: 302,
                            headers: new Map(Object.entries({'Location': '/form-dashboard'}))
                        });
                    }
                });
            })
        });
    }
}

