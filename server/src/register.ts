import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse, streamToString} from "./utility";
import * as querystring from "querystring";

const successSubmissionFormHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Success</title></head>
<body>
<h1>Successful Registration</h1>
<a href="/home">Home</a>
</body>
</html>`

export function registerRequestListener(con: Connection): MyHttpListener {
    return function (req, url) {
        return streamToString(req).then(function (bodyString) {
            const p = querystring.parse(bodyString);

            return new Promise((resolve, reject) => {
                con.query(`INSERT INTO form_dashboard_users (username, password, email)
                           VALUES (?, ?, ?)`, [p.username, p.password, p.email],
                    function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }else {
                            resolve({
                                headers: new Map(Object.entries({
                                    'content-type': 'text/html'
                                })),
                                body: successSubmissionFormHtml
                            } as MyHttpResponse);
                        }
                    });
            })
        });
    }
}