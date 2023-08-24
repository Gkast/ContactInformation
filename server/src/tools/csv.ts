import {Connection} from "mysql";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {MyHttpListener} from "../util/my-http/my-http";
import {downloadResponse} from "../util/my-http/200";
import {mysqlQuery} from "../util/utility";

export function testCSVReqList(con: Connection): MyHttpListener {
    return () => mysqlQuery(con,
        `SELECT a.*
         FROM authors a,
              authors a2`)
        .then(result => downloadResponse('test.csv', stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]) + stringify(result)))

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