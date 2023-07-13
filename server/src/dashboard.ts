import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse} from "./utility";
import {format as dateFormat} from "fecha";
import {headerHtml} from "./header";

export function submittedContactFormsRequestListener(con: Connection): MyHttpListener {
    return (req, url, user) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT *
                       FROM contact_form_submits
                       WHERE firstname IS NOT NULL
                       ORDER BY datetime_submitted DESC`, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    let queryToHtml = "";
                    (result as any[]).forEach((row, i) => {
                        queryToHtml += `
<tr>
    <td>${i + 1}</td><td>${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
    <td>${row.firstname}</td><td>${row.lastname}</td>
    <td>${row.email}</td><td>${row.subject}</td>
    <td>${row.message}</td>
    <td><a href="/form-dashboard/${row.id}">Edit</a></td>
    <td>
        <form action="/form-dashboard/${row.id}/delete" method="post" onsubmit="confirm('Are you sure?')" 
        class="action-button">
        <button>DELETE</button></form>
    </td>
</tr>`
                    });

                    const submittedContactFormHtmlString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Submitted Contact Forms</title>
<link rel="stylesheet" href="/assets/css/form-dashboard.css"></head>
<body>` + headerHtml(user) + `
<table>
    <thead>
    <tr>
        <th>#</th>
        <th>Submitted Time</th>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Email</th>
        <th>Subject</th>
        <th>Message</th>
        <th>Edit</th>
        <th>Delete</th>
    </tr>
    </thead>
    <tbody>
        ${queryToHtml}
    </tbody>
</table>
<ul>
    <li><a href="/home" class="action-button">Home</a></li>
    <li><a href="/form-dashboard" class="action-button">Refresh</a></li>
</ul>
</body>
</html>`;
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: submittedContactFormHtmlString
                    } as MyHttpResponse);
                }
            });
        });
    }
}