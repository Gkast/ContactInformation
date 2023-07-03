import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";

export function loginRequestListener(con: Connection): MyHttpListener {
    return function (req) {
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`SELECT username, password
                           FROM form_dashboard_users
                           WHERE username = (?)
                             AND password = (?)`, [p.username, p.password],
                    function (err, results) {
                        if (err) {
                            reject(err);
                            return;
                        } else {
                            if (results.length === 0) {
                                resolve({
                                    status: 401,
                                    headers: new Map(Object.entries({
                                        'content-type': 'text/plain'
                                    })),
                                    body: "wrong credentials"
                                } as MyHttpResponse);
                            } else {
                                resolve({
                                    status: 302,
                                    headers: new Map(Object.entries({'Location': '/form-dashboard'}))
                                } as MyHttpResponse);
                            }
                        }
                    });
            })
        });
    }
}