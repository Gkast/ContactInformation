import {Connection} from "mysql";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {MyHttpListener} from "../my-http/my-http";
import {downloadResponse} from "../my-http/responses/200";

export function testCSVReqList(con: Connection): MyHttpListener {
    return () => new Promise((resolve, reject) =>
        con.query(`SELECT a.*
                   FROM authors a,
                        authors a2`, (err, result: any[]) => {
            err ? reject(err) : resolve(downloadResponse('test.csv', stringify([['Id', 'Firstname', 'Lastname',
                'E-Mail', 'Birthdate', 'Added']]) + stringify(result)))
        })
    )
}

export function TestCSVStreamReqList(con: Connection): MyHttpListener {
    return () => Promise.resolve(downloadResponse('test stream.csv', res => {
        res.write(stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]));
        con.query(`SELECT a.*
                   FROM authors a,
                        authors a2`).stream().on('data', (row) => {
            res.write(stringify(Object.values([row])))
        }).on('end', () => {
            res.end();
        });
    }))
}

export function TestCSVStreamPipeReqList(con: Connection): MyHttpListener {
    return () => Promise.resolve(downloadResponse('test stream pipe.csv', res => {
        res.write(stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]));
        con.query(`SELECT a.*
                   FROM authors a,
                        authors a2`).stream().pipe(stringifyStream()).pipe(res);
    }))
}