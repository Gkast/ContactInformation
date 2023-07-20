import {Connection} from "mysql";
import {upperCaseFirstLetter, xmlEscape} from "../util/utility";
import {format as dateFormat} from "fecha";
import {pageHtml} from "./skeleton-page/page";
import * as fs from "fs";
import {Transform, TransformCallback} from "stream";
import {MyHttpListener, MyHttpResponse} from "../util/my-http";

export function contactListPage(con: Connection): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            con.query(`SELECT c.*, u.username
                       FROM contact_form_submits c
                                JOIN users u on u.id = c.user_id
                           ${user.admin ? `` : `WHERE c.user_id = ?`}
                       ORDER BY c.datetime_submitted
            DESC`, user.admin ? [] : [user.id], (err, result, fields) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    let queryToHtml = "";
                    (result as any[]).forEach((row, i) => {
                        queryToHtml += `
<tr>
    <td class="cell">${i + 1}</td>
    ${user.admin ? `<td class="cell">${xmlEscape(row.username)}</td>` : ''}
    <td class="cell">${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
    <td class="cell">${xmlEscape(row.firstname)}</td>
    <td class="cell">${xmlEscape(row.lastname)}</td>
    <td class="cell">${xmlEscape(row.email)}</td>
    <td class="cell">${xmlEscape(row.subject)}</td>
    <td class="cell"><pre>${xmlEscape(row.message)}</pre></td>
    <td class="cell"><a href="/contact-list/${row.id}" class="no-underline"><button class="btn">Edit</button></a></td>
    <td class="cell">
        <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
        <button class="btn delete-btn">DELETE</button>
        </form>
    </td>
</tr>`
                    });
                    const contentHtml = `<table class="contact-list">
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
        <th class="cell" colspan="2">Action</th>
    </tr>
    </thead>
    <tbody>
        ${queryToHtml}
    </tbody>
</table>
<a href="/contact-list" class="no-underline">
    <button class="btn">Refresh</button>
</a>
<a href="/contact-list-csv" class="no-underline">
    <button class="btn">Export to CSV</button>
</a>
<a href="/contact-list-xml" class="no-underline">
    <button class="btn">Export to XML</button>
</a>
<a href="/contact-list-json" class="no-underline">
    <button class="btn">Export to JSON</button>
</a>`
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: pageHtml({user: user, title: "Contact List"}, contentHtml)
                    } as MyHttpResponse);
                }
            });
        })
}

export function uploadsPage(): MyHttpListener {
    return (req, user) =>
        new Promise((resolve, reject) => {
            let fileQueryHtml = '';
            fs.readdir('../uploads/', (err, files) => {
                files.forEach((file, i) => {
                    fileQueryHtml += `
<tr>
    <td class="cell">${i + 1}</td>
    <td class="cell">${file}</td>
    <td class="cell"><a href="/uploads/${file}" class="no-underline"><button class="btn">Preview</button></a></td>
    <td class="cell"><a href="/uploads/${file}?download=1" class="no-underline"><button class="btn download-btn">Download</button></a></td>
</tr>`
                })
                if (err) {
                    reject(err)
                    return;
                } else {
                    const contentHtml = `<table class="contact-list">
    <thead>
    <tr>
        <th class="cell">#</th>
        <th class="cell">File Name</th>
        <th class="cell" colspan="2">Actions</th>
    </tr>
    </thead>
    <tbody>
        ${fileQueryHtml}
    </tbody>
</table>
<a href="/file-list" class="no-underline"><button class="btn">Refresh</button></a>`
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: pageHtml({user: user, title: "Files"}, contentHtml)
                    })
                }
            })
        })
}

// export function contactListPageVersion2(con: Connection): MyHttpListener {
//     return (req, user) => {
//         return Promise.resolve({
//             status: 200,
//             headers: new Map(Object.entries({'content-type': 'text/html'})),
//             body: res => {
//                 let i = 0;
//                 res.write(pageHtmlTop({user: user, title: "Contact List"}));
//                 res.write(`<table class="contact-list">
//     <thead>
//     <tr>
//         <th class="cell">#</th>
//         ${user.admin ? `<th class="cell">Username</th>` : ``}
//         <th class="cell">Submitted Time</th>
//         <th class="cell">Firstname</th>
//         <th class="cell">Lastname</th>
//         <th class="cell">Email</th>
//         <th class="cell">Subject</th>
//         <th class="cell">Message</th>
//         <th class="cell" colspan="2">Action</th>
//     </tr>
//     </thead>
//     <tbody>`);
//                 con.query(`SELECT c.*, u.username
//                            FROM contact_form_submits c
//                                     JOIN users u on u.id = c.user_id
//                                ${user.admin ? `` : `WHERE c.user_id = ?`}
//                            ORDER BY c.datetime_submitted
//                 DESC`, user.admin ? [] : [user.id]).stream().pipe(new Transform({
//                     objectMode: true,
//                     transform(row: any, encoding: BufferEncoding, callback: TransformCallback) {
//                         i++;
//                         callback(null, `
// <tr>
//     <td class="cell">${i}</td>
//     ${user.admin ? `<td class="cell">${upperCaseFirstLetter(row.username)}</td>` : ''}
//     <td class="cell">${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
//     <td class="cell">${row.firstname}</td>
//     <td class="cell">${row.lastname}</td>
//     <td class="cell">${row.email}</td>
//     <td class="cell">${row.subject}</td>
//     <td class="cell">${row.message}</td>
//     <td class="cell"><a href="/contact-list/${row.id}" class="no-underline"><button class="btn">Edit</button></a></td>
//     <td class="cell">
//         <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
//         <button class="btn delete-btn">DELETE</button>
//         </form>
//     </td>
// </tr>`)
//                     }
//                 })).on('end', function () {
//                     res.write(`</tbody>
// </table>
// <a href="/contact-list">
//     <button class="btn">Refresh</button>
// </a>`);
//                     res.end(pageHtmlBottom({user: user, title: "Contact List"}));
//                 }).pipe(res, {end: false})
//             }
//         });
//     }
// }