import {MyHttpListener} from "../../util/my-http/my-http";
import {mysqlQuery, streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../util/my-http/successful-response";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";
import * as randomstring from "randomstring";

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
                    user: user, contentHtml: `
                <h1>Successful Reservation</h1>
        <p>Your Reservation ID: ${results['insertId']}</p>
        <a href="/home" class="no-underline">
            <button class="btn">Home</button>
        </a>`
                }))
            }))
    })
}

export function changeSeatReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `UPDATE seat_reserved
             SET is_cancelled = 1
             WHERE id = ?`, [p.previous_seat])
            .then(result => mysqlQuery(con,
                `INSERT INTO seat_reserved
                 SET seat_id        = ?,
                     screening_id   = ?,
                     reservation_id = ?`, [p.seat, p.scr_id, p.res_id])
                .then(result1 => pageHtmlResponse({
                    title: 'Seat Changed',
                    user: user,
                    contentHtml: `<h1>Your seat changed successfully</h1>`
                })))
    })
}

export function cancelReservationReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `UPDATE reservation
             SET is_cancelled = 1
             WHERE id = (SELECT reservation_id
                         FROM cancel_reservation_tokens
                         WHERE token_value = ?
                           AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`, [p.token])
            .then(results => pageHtmlResponse({
                title: 'Success',
                user: user,
                contentHtml: `<h1>Reservation Cancelled</h1>`
            }))
            .catch(reason => pageHtmlResponse({
                user: user,
                title: "Token Expired",
                contentHtml: `<h1>Token Expired</h1>`
            }))
    });
}

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
                }).then(value => pageHtmlResponse({
                    title: 'Cancellation Link Sent',
                    user: user,
                    contentHtml: `<h1>Your cancellation link has been sent</h1>`
                })))
        })
    })
}