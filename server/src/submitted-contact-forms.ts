import {MyHttpListener, MyHttpResponse} from "./utility";
import {Connection} from "mysql";

export function submittedContactFormsRequestListener(con: Connection): MyHttpListener {
    return function (req, url) {
        return new Promise((resolve, reject) => {
            con.query(`SELECT *
                       FROM contact_form_submits
                       WHERE firstname IS NOT NULL`, function (err, result, fields) {
                if (err) {
                    reject(err);
                    return;
                } else {
                    let queryToHtml = "";
                    (result as any[]).forEach((row, i) => {
                        queryToHtml += `<tr><td>${row.id}</td><td>${row.datetime_submitted}</td>
<td>${row.firstname}</td><td>${row.lastname}</td>
<td>${row.email}</td><td>${row.subject}</td><td>${row.message}</td></tr>`
                    });
                    const submittedContactFormHtmlString = "<!DOCTYPE html>\n" +
                        "<html lang=\"en\">\n" +
                        "<head>\n" +
                        "    <meta charset=\"UTF-8\">\n" +
                        "    <title>Submitted Contact Forms</title>\n" +
                        "<link rel=\"stylesheet\" href=\"/assets/css/form-dashboard.css\">" +
                        "</head>\n" +
                        "<body>\n" +
                        "<table>\n" +
                        "    <thead>\n" +
                        "    <tr>\n" +
                        "        <th>ID</th>\n" +
                        "        <th>Submitted Time</th>\n" +
                        "        <th>Firstname</th>\n" +
                        "        <th>Lastname</th>\n" +
                        "        <th>Email</th>\n" +
                        "        <th>Subject</th>\n" +
                        "        <th>Message</th>\n" +
                        "    </tr>\n" +
                        "    </thead>\n" +
                        "    <tbody>\n" +
                        `${queryToHtml}` +
                        "    </tbody>\n" +
                        "</table>\n" +
                        "<a href=\"/home\">Home</a>\n" +
                        "<a href=\"/submitted-contact-forms\">Refresh</a>\n" +
                        "</body>\n" +
                        "</html>";
                    resolve({
                        headers: new Map(Object.entries({
                            'content-type': 'text/html'
                        })),
                        body: submittedContactFormHtmlString
                    } as MyHttpResponse);
                }
            });
        });
    }
}