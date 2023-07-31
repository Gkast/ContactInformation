import {Connection} from "mysql";
import {streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";

export function registerReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) =>
            con.query(`INSERT INTO users (username, password, email)
                       VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                err => err ? reject(err) : resolve(pageHtmlResponse({user: user, title: "Successful Registration"}, `
<h1>Successful Registration</h1>
<a href="/home" class="no-underline">
    <button class="btn">Home</button>
</a>`))
            ));
    });
}