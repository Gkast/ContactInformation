import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse} from "./utility";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {pageNotFound} from "./page";

export function exportCSVContacts(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            const id = parseInt(req.url.pathname.split('/')[2], 10);
            if (!id) {
                resolve(pageNotFound());
                return;
            }
            con.query(`SELECT DATE_FORMAT(datetime_submitted, '%d/%m/%Y'),
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

export function testCSV(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            con.query(`SELECT a.*
                       FROM authors a, authors a2`, (err, result: any[], fields) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve({
                            headers: new Map(Object.entries({
                                'Content-Disposition': 'attachment; filename="test.csv"'
                            })),
                            body: stringify([['Id', 'Firstname', 'Lastname',
                                    'E-Mail', 'Birthdate', 'Added']]) +
                                stringify(result)
                        })
                    }
                })
        })
}

export function TestCSVStreamPipe(con: Connection): MyHttpListener {
    return (req, user) =>
        Promise.resolve({
            headers: new Map(Object.entries({
                'Content-Disposition': 'attachment; filename="test stream pipe.csv"'
            })),
            body: res => {
                res.write(stringify([['Id', 'Firstname', 'Lastname',
                    'E-Mail', 'Birthdate', 'Added']]));
                con.query(`SELECT a.*
                           FROM authors a, authors a2`).stream().pipe(stringifyStream()).pipe(res)
                return;
            }
        } as MyHttpResponse)
}

export function TestCSVStream(con: Connection): MyHttpListener {
    return (req, user) =>
        Promise.resolve({
            headers: new Map(Object.entries({
                'Content-Disposition': 'attachment; filename="test stream.csv"'
            })),
            body: res => {
                res.write(stringify([['Id', 'Firstname', 'Lastname',
                    'E-Mail', 'Birthdate', 'Added']]));
                con.query(`SELECT a.*
                           FROM authors a, authors a2`).stream().on('data', function (row) {
                    res.write(stringify(Object.values([row])))
                }).on('end', function () {
                    res.end();
                });
                return;
            }
        } as MyHttpResponse)
}