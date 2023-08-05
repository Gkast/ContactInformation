import {Connection} from "mysql";
import {MyHttpListener} from "../../../util/my-http/my-http";
import {mysqlQuery, streamToString} from "../../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../../util/my-http/responses/200";

export function cancelReservationReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `UPDATE reservation
             SET is_cancelled = 1
             WHERE id = (SELECT reservation_id
                         FROM cancel_reservation_tokens
                         WHERE token_value = ?
                           AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`, [p.token])
            .then(results => pageHtmlResponse({title: 'Success', user: user}, `<h1>Reservation Cancelled</h1>`))
            .catch(reason => pageHtmlResponse({user: user, title: "Token Expired"}, `<h1>Token Expired</h1>`))
    });
}