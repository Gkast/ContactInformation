import {Connection} from "mysql";
import {xmlEscape} from "../utility";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {MyHttpListener} from "../my-http/my-http";
import {pageResponseStream} from "../my-http/responses/200";


export function exportCSVContactsReqList(con: Connection): MyHttpListener {
    return (req, user) => Promise.resolve(pageResponseStream('text/plain', res => {
        res.write(stringify([['Contact Id', 'Submitted Date', 'Firstname', 'Lastname',
            'E-Mail', 'Subject', 'Message']]));
        con.query(`SELECT id,
                          DATE_FORMAT(datetime_submitted, '%d/%m/%Y'),
                          firstname,
                          lastname,
                          email,
                          subject,
                          message
                   FROM contact_form_submits ${user.admin ? '' : 'WHERE user_id=?'}`,
            user.admin ? [] : [user.id]).stream().pipe(stringifyStream()).pipe(res)
    }))
}

export function exportXMLContactsReqList(con: Connection): MyHttpListener {
    return (req, user) => Promise.resolve(pageResponseStream('text/xml', res => {
        res.write(`<?xml version="1.0" encoding="UTF-8"?>
                <data>`);
        con.query(`SELECT id,
                          DATE_FORMAT(datetime_submitted, '%d/%m/%Y') AS date,
                          firstname,
                          lastname,
                          email,
                          subject,
                          message
                   FROM contact_form_submits ${user.admin ? '' : 'WHERE user_id=?'}`,
            user.admin ? [] : [user.id]).stream().on('data', (row) => {
            res.write(`
<row id="${row.id}">
    <datetime_submitted>
        ${row.date}
    </datetime_submitted>
    <firstname>
        ${xmlEscape(row.firstname)}
    </firstname>
    <lastname>
        ${xmlEscape(row.lastname)}
    </lastname>
    <email>
        ${xmlEscape(row.email)}
    </email>
    <subject>
        ${xmlEscape(row.subject)}
    </subject>
    <message>
        ${xmlEscape(row.message)}
    </message>
</row>`)
        }).on('end', () => {
            res.end(`</data>`);
        });
    }))
}

export function exportJSONContactsReqList(con: Connection): MyHttpListener {
    return (req, user) => Promise.resolve(pageResponseStream('text/json', res => {
        con.query(`SELECT id,
                          DATE_FORMAT(datetime_submitted, '%d/%m/%Y') AS date,
                          firstname,
                          lastname,
                          email,
                          subject,
                          message
                   FROM contact_form_submits ${user.admin ? '' : 'WHERE user_id=?'}`,
            user.admin ? [] : [user.id]).stream().on('data', row => {
            res.write(JSON.stringify(row, null, 4) + "\n\n")
        }).on('end', () => {
            res.end();
        })
    }))
}