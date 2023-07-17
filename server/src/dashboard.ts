import {Connection} from "mysql";
import {MyHttpListener, MyHttpResponse} from "./utility";
import {format as dateFormat} from "fecha";
import {pageHtml} from "./page";

export function submittedContactFormsPageRequestListener(con: Connection): MyHttpListener {
    return (req, user) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT c.*, u.username
                       FROM contact_form_submits c
                                JOIN users u on u.id = c.user_id
                           ${user.admin ? `` : `WHERE c.user_id = ?`}
                       ORDER BY c.datetime_submitted
            DESC`, user.admin ? [] : [user.id], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    let queryToHtml = "";
                    (result as any[]).forEach((row, i) => {
                        queryToHtml += `
<tr>
    <td class="cell">${i + 1}</td>
    ${user.admin ? `<td class="cell">${row.username.toUpperCase()}</td>` : ''}
    <td class="cell">${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
    <td class="cell">${row.firstname}</td>
    <td class="cell">${row.lastname}</td>
    <td class="cell">${row.email}</td>
    <td class="cell">${row.subject}</td>
    <td class="cell">${row.message}</td>
    <td class="cell"><a href="/dashboard/${row.id}">Edit</a></td>
    <td class="cell">
        <form data-confirm-text="Are you sure?" action="/dashboard/${row.id}/delete" method="post" class="action-button">
        <button>DELETE</button>
        </form>
    </td>
</tr>`
                    });
                    const contentHtml = `<table class="dashboard">
    <thead>
    <tr>
        <th class="cell">#</th>
        ${user.admin ? `<th class="cell">Username</th>` : ``}
        <th class="cell">Submitted Time</th>
        <th class="cell">Firstname</th>
        <th class="cell">Lastname</th>
        <th class="cell">Email</th>
        <th class="cell">Subject</th>
        <th class="cell">Message</th>
        <th class="cell">Edit</th>
        <th class="cell">Delete</th>
    </tr>
    </thead>
    <tbody>
        ${queryToHtml}
    </tbody>
</table>
<a href="/dashboard" class="action-button">Refresh</a>`
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: pageHtml({user: user, title: "Dashboard"}, contentHtml)
                    } as MyHttpResponse);
                }
            });
        });
    }
}