import {Connection} from "mysql";
import {Transporter} from "nodemailer";
import {streamToString} from "../utility";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import {MyHttpListener} from "../my-http/my-http";
import {wrongCredentialsResponse} from "../my-http/responses/400";
import {redirectResponse} from "../my-http/responses/300";

export function recoveryTokenGeneratorReqList(con: Connection, smtpTransport: Transporter): MyHttpListener {
    return (req) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
            con.query(`SELECT id, email
                       FROM users
                       WHERE username = ?`, [p.username], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    if (results.length === 0) {
                        resolve(wrongCredentialsResponse())
                    } else {
                        const recoveryToken = randomstring.generate({
                            length: 6,
                            charset: "alphanumeric",
                            capitalization: "lowercase"
                        });
                        con.query(`INSERT INTO recovery_tokens (token_value, user_id, ip_address, user_agent)
                                       VALUE (?, ?, ?, ?)`, [recoveryToken, results[0].id, req.remoteAddr,
                                req.headers["user-agent"]],
                            err1 => err1 ? reject(err1) : smtpTransport.sendMail({
                                from: 'noreply@giorgokastanis.com',
                                to: results[0].email,
                                subject: 'Recovery Token',
                                text: 'Your Recovery Token: ' + recoveryToken + '\n\nExpires in 30 minutes.'
                            }, (error) => error ? reject(error) : resolve(redirectResponse('/token-verify')))
                        );
                    }
                }
            }));
    });
}