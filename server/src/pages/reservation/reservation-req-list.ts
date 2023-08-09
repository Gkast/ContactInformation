import {MyHttpListener} from "../../util/my-http/my-http";
import {mysqlQuery, streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";

export function reservationReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con, `INSERT INTO reservation (screening_id, reserved_by, email)
                                VALUES (?, ?, ?)`, [p.id, p.name, p.email])
            .then(results => mysqlQuery(con,
                `INSERT INTO seat_reserved (seat_id, reservation_id, screening_id)
                 VALUES (?, ?, ?)`, [p.seat, results['insertId'], p.id]).then(results1 => {
                return smtpTransport.sendMail({
                    from: 'noreply@giorgokastanis.com',
                    to: p.email,
                    subject: 'Reservation Ticket',
                    text: 'Your Reservation Ticket ID: ' + results['insertId']
                }).then(value => pageHtmlResponse({
                    title: 'Successful Reservation',
                    user: user
                }, `
                <h1>Successful Reservation</h1>
        <p>Your Reservation ID: ${results['insertId']}</p>
        <a href="/home" class="no-underline">
            <button class="btn">Home</button>
        </a>`))
            }))
    })
}