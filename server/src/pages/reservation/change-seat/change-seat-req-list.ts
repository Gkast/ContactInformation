import {Connection} from "mysql";
import {MyHttpListener} from "../../../util/my-http/my-http";
import {mysqlQuery, streamToString} from "../../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../../util/my-http/responses/200";

export function changeSeatReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        console.log(p.previous_seat);
        return mysqlQuery(con,
            `UPDATE seat_reserved
             SET is_cancelled = 1
             WHERE id = ?`, [p.previous_seat])
            .then(result => mysqlQuery(con,
                `INSERT INTO seat_reserved
                 SET seat_id        = ?,
                     screening_id   = ?,
                     reservation_id = ?`, [p.seat, p.scr_id, p.res_id])
                .then(result1 => pageHtmlResponse({title: 'Seat Changed', user: user},
                    `<h1>Your seat changed successfully</h1>`)))

    })
}