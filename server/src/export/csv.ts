import {Connection} from "mysql";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {MyHttpListener, MyHttpResponse} from "../util/my-http";

export function testCSVReqList(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            con.query(`SELECT a.*
                       FROM authors a,
                            authors a2`, (err, result: any[], fields) => {
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

export function TestCSVStreamReqList(con: Connection): MyHttpListener {
    return (req, user) =>
        Promise.resolve({
            headers: new Map(Object.entries({
                'Content-Disposition': 'attachment; filename="test stream.csv"'
            })),
            body: res => {
                res.write(stringify([['Id', 'Firstname', 'Lastname',
                    'E-Mail', 'Birthdate', 'Added']]));
                con.query(`SELECT a.*
                           FROM authors a,
                                authors a2`).stream().on('data', function (row) {
                    res.write(stringify(Object.values([row])))
                }).on('end', function () {
                    res.end();
                });
                return;
            }
        } as MyHttpResponse)
}

export function TestCSVStreamPipeReqList(con: Connection): MyHttpListener {
    return (req, user) =>
        Promise.resolve({
            headers: new Map(Object.entries({
                'Content-Disposition': 'attachment; filename="test stream pipe.csv"'
            })),
            body: res => {
                res.write(stringify([['Id', 'Firstname', 'Lastname',
                    'E-Mail', 'Birthdate', 'Added']]));
                con.query(`SELECT a.*
                           FROM authors a,
                                authors a2`).stream().pipe(stringifyStream()).pipe(res)
                return;
            }
        } as MyHttpResponse)
}