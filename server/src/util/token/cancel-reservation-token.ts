import {Connection} from "mysql";
import {MyHttpListener} from "../my-http/my-http";
import {mysqlQuery, streamToString} from "../utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {Transporter} from "nodemailer";
import {redirectResponse} from "../my-http/responses/300";
import {pageHtmlResponse} from "../my-http/responses/200";

export function cancelReservationTokenReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con, `SELECT id, email
                                FROM reservation
                                WHERE id = ?`, [p.id]).then(results => {
            const cancellationToken = randomstring.generate({
                length: 6,
                charset: "alphanumeric",
                capitalization: "lowercase"
            })
            const cancellationLink = `http://localhost:3000/cancel-reservation?token=${cancellationToken}`
            return mysqlQuery(con,
                `INSERT INTO cancel_reservation_tokens (token_value, reservation_id)
                 VALUES (?, ?)`, [cancellationToken, results[0].id])
                .then(results1 => smtpTransport.sendMail({
                    from: 'noreply@giorgokastanis.com',
                    to: results[0].email,
                    subject: 'Cancel Reservation Token',
                    html: `<p>To cancel your reservation press the link bellow</p>` +
                        `<a href=${cancellationLink}><button 
style="background-color: white;
    border: 2px solid black;
    border-radius: 10px;
    color: black;
    font-family: monospace;
    font-weight: bold;
    font-size: 16px;
    padding: 10px 20px;
    cursor: pointer;"
    >Cancel Reservation</button></a>` +
                        `<p>Expires in 30 Minutes</p>`
                }).then(value => pageHtmlResponse({title: 'Cancellation Link Sent', user: user},
                    `<h1>Your cancellation link has been sent</h1>`)))
        })
    })
}