import {Connection} from "mysql";
import {MyHttpListener} from "./utility";
import {stringify} from "csv-stringify/sync";
import {pageNotFound} from "./page";

export function exportCSVContacts(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            const id = parseInt(req.url.pathname.split('/')[2], 10);
            if (!id) {
                resolve(pageNotFound());
                return;
            }
            con.query(`
                SELECT DATE_FORMAT(datetime_submitted, '%d/%m/%Y'),
                       firstname,
                       lastname,
                       email,
                       subject,
                       message
                FROM contact_form_submits ${user.admin ? '' : 'WHERE user_id=?'}`, user.admin ? [] : [id],
                (err, result: any[], fields) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({
                        headers: new Map(Object.entries({
                            'Content-Disposition': 'attachment; filename="contacts.csv"'
                        })),
                        body: stringify([['Submitted Date', 'Firstname', 'Lastname',
                                'E-Mail', 'Subject', 'Message']]) +
                            stringify(result)
                    })
                }
            })
        })
}

// export function csvPageStreamPipe(con: Connection): MyHttpListener {
//     return (req, user) =>
//         Promise.resolve({
//             headers: new Map(Object.entries({'content-type': 'text/plain'})),
//             body: res => {
//                 res.write(stringify([['Cookie ID', 'User ID', 'Login time',
//                     'Has logged out', 'Logged out time', 'Last Update At', 'Remember me', 'IP', 'User-Agent']]));
//                 con.query(`
//                     SELECT cookie_value                                  AS 'Cookie ID',
//                            user_id                                       AS 'User ID',
//                            login_time                                    AS 'Login time',
//                            IF(has_logged_out = 1, 'yes', 'no')           AS 'Has logged out',
//                            DATE_FORMAT(logout_time, '%d/%m/%Y')          AS 'Logged out time',
//                            DATE_FORMAT(last_update_datetime, '%d/%m/%Y') AS 'Last Update At',
//                            IF(remember_me = 1, 'yes', 'no')              AS 'Remember me',
//                            ip_address                                    AS 'IP',
//                            user_agent                                    AS 'User-Agent'
//                     FROM login_cookies`).stream().pipe(stringifyStream()).pipe(res)
//                 return;
//             }
//         } as MyHttpResponse)
// }
//
// export function csvPageStream(con: Connection): MyHttpListener {
//     return (req, user) =>
//         Promise.resolve({
//             headers: new Map(Object.entries({'content-type': 'text/plain'})),
//             body: res => {
//                 res.write(stringify([['Cookie ID', 'User ID', 'Login time',
//                     'Has logged out', 'Logged out time', 'Last Update At', 'Remember me', 'IP', 'User-Agent']]));
//                 con.query(`
//                     SELECT cookie_value                                  AS 'Cookie ID',
//                            user_id                                       AS 'User ID',
//                            login_time                                    AS 'Login time',
//                            IF(has_logged_out = 1, 'yes', 'no')           AS 'Has logged out',
//                            DATE_FORMAT(logout_time, '%d/%m/%Y')          AS 'Logged out time',
//                            DATE_FORMAT(last_update_datetime, '%d/%m/%Y') AS 'Last Update At',
//                            IF(remember_me = 1, 'yes', 'no')              AS 'Remember me',
//                            ip_address                                    AS 'IP',
//                            user_agent                                    AS 'User-Agent'
//                     FROM login_cookies`).stream().on('data', function (row) {
//                     res.write(stringify(Object.values([row])))
//                 }).on('end', function () {
//                     res.end();
//                 });
//                 return;
//             }
//         } as MyHttpResponse)
// }