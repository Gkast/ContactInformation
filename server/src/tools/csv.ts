import {Pool} from "mysql";
import {stringify} from "csv-stringify/sync";
import {stringify as stringifyStream} from "csv-stringify";
import {MyHttpListener} from "../util/my-http/http-handler";
import {downloadResponse} from "../util/my-http/responses/successful-response";
import {mysqlQuery} from "../util/util";

export function testCSVReqList(con: Pool): MyHttpListener {
    return async () => {
        const result = await mysqlQuery(con,
            `SELECT a.*
             FROM authors a,
                  authors a2`);
        return downloadResponse('test.csv', stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]) + stringify(result));
    }
}

export function TestCSVStreamReqList(con: Pool): MyHttpListener {
    return async () => downloadResponse('test stream.csv', res => {
        res.write(stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]));
        con.query(`SELECT a.*
                   FROM authors a,
                        authors a2`).stream().on('data', (row) => {
            res.write(stringify(Object.values([row])))
        }).on('end', () => {
            res.end();
        });
    })
}

export function TestCSVStreamPipeReqList(con: Pool): MyHttpListener {
    return async () => downloadResponse('test stream pipe.csv', res => {
        res.write(stringify([['Id', 'Firstname', 'Lastname',
            'E-Mail', 'Birthdate', 'Added']]));
        con.query(`SELECT a.*
                   FROM authors a,
                        authors a2`).stream().pipe(stringifyStream()).pipe(res);
    })
}