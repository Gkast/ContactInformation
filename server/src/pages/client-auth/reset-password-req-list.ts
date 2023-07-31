import {streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";

export function changePasswordReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
            con.query(`UPDATE users
                       SET password = ?
                       WHERE id = (SELECT user_id
                                   FROM recovery_tokens
                                   WHERE token_value = ?
                                     AND DATE_ADD(created_token_time, INTERVAL 30 MINUTE) > CURRENT_TIMESTAMP)`,
                [p.password, p.token],
                (err, results) => err ? reject(err) : results.affectedRows > 0 ?
                    resolve(pageHtmlResponse({user: user, title: "Success"}, `<h1>Password Changed</h1>`)) :
                    resolve(pageHtmlResponse({user: user, title: "Token Expired"}, `<h1>Token Expired</h1>`))
            ));
    });
}