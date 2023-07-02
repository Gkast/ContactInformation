import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";

const successSubmissionFormHtml = "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "    <meta charset=\"UTF-8\">\n" +
    "    <title>Success</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<h1>Successful Submission</h1>\n" +
    "<a href=\"/home\">Home</a>\n" +
    "</body>\n" +
    "</html>";

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
