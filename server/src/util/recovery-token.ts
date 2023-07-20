import {Connection} from "mysql";
import {Transporter} from "nodemailer";
import {streamToString} from "./utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {MyHttpListener} from "./my-http";


import {redirectResponse, wrongCredentialsResponse} from "./page-responses";

export function recoveryTokenGenerator(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req, user) =>
        streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) => {
                con.query(`SELECT id, email
                           FROM users
                           WHERE username = ?`, [p.username], (err, results, fields) => {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        if (results.length === 0) {
                            resolve(wrongCredentialsResponse())
                        } else {
                            const recoveryToken = randomstring.generate({
                                length: 6,
                                charset: "numeric"
                            });
                            con.query(`INSERT INTO recovery_tokens (token_value, user_id)
                                           VALUE (?, ?)`, [recoveryToken, results[0].id],
                                (err1, results1) => {
                                    if (err1) {
                                        reject(err1);
                                        return;
                                    } else {
                                        smtpTransport.sendMail({
                                            from: 'noreply@giorgokastanis.com',
                                            to: results[0].email,
                                            subject: 'Recovery Token',
                                            text: 'Your Recovery Token: ' + recoveryToken + '\n\nExpires in 30 minutes.'
                                        }, (error) => {
                                            if (error) {
                                                reject(error);
                                            } else {
                                                resolve(redirectResponse('/token-verify'))
                                            }
                                        });
                                    }
                                })
                        }
                    }
                })
            })
        })
}

// export function recoveryTokenVerifier(con: Connection): MyHttpListener {
//     return (req, user) => streamToString(req.body).then(bodyString => {
//         const p = querystring.parse(bodyString);
//         return new Promise((resolve, reject) => {
//             con.query(`SELECT *
//                        FROM recovery_tokens
//                        WHERE token_value = ?
//                          AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP`, [p.token],
//                 (err, results, fields) => {
//                     if (err) {
//                         reject(err);
//                         return;
//                     } else {
//                         resolve({
//                             status: 302,
//                             headers: new Map(Object.entries({
//                                 "Location": `/change-password?token=${encodeURIComponent(singleParam(p.token))}`
//                             }))
//                         })
//                     }
//                 })
//         })
//     })
// }