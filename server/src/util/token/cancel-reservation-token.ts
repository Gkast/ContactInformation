import {Connection} from "mysql";
import {MyHttpListener} from "../my-http/my-http";
import {mysqlQuery, streamToString} from "../utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {Transporter} from "nodemailer";
import {redirectResponse} from "../my-http/responses/300";

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
            return mysqlQuery(con,
                `INSERT INTO cancel_reservation_tokens (token_value, reservation_id)
                 VALUES (?, ?)`, [cancellationToken, results[0].id])
                .then(results1 => smtpTransport.sendMail({
                    from: 'noreply@giorgokastanis.com',
                    to: results[0].email,
                    subject: 'Cancel Reservation Token',
                    text: 'Your Cancellation Token: ' + cancellationToken + `\n\n Expires in 30 Minutes`
                }).then(value => redirectResponse('/cancel-token-verify')))
        })
    })
}