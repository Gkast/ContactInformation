import {Connection} from "mysql";
import {xmlEscape} from "../util/utility";
import {format as dateFormat} from "fecha";
import * as fs from "fs";
import {MyHttpListener} from "../util/my-http/my-http";
import {Transform, TransformCallback} from "stream";
import {pageHtmlResponse, PageResponseStream} from "../util/my-http/responses/200";
import {pageHtmlBottom, pageHtmlTop} from "./skeleton-page-html/skeleton-page";

export function contactListPage(con: Connection): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) => {
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
    <td>${i + 1}</td>
    ${user.admin ? `<td>${xmlEscape(row.username)}</td>` : ''}
    <td>${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
    <td>${xmlEscape(row.firstname)}</td>
    <td>${xmlEscape(row.lastname)}</td>
    <td>${xmlEscape(row.email)}</td>
    <td>${xmlEscape(row.subject)}</td>
    <td data-message="message cell">
        <pre>${xmlEscape(row.message)}</pre>
    </td>
    <td>
        <a href="/contact-list/${row.id}">
            <button>Edit</button>
        </a>
    </td>
    <td>
        <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
            <button>DELETE</button>
        </form>
    </td>
</tr>`
                });
                resolve(pageHtmlResponse({user: user, title: "Contact List"}, `
<input type="text" placeholder="Search messages" data-contact-search="contact-search">
<table>
    <thead>
    <tr>
        <th>#</th>
        ${user.admin ? `<th>Username</th>` : ``}
        <th>Submitted Time</th>
        <th>Firstname</th>
        <th>Lastname</th>
        <th>Email</th>
        <th>Subject</th>
        <th>Message</th>
        <th colspan="2">Action</th>
    </tr>
    </thead>
    <tbody>
        ${queryToHtml}
    </tbody>
</table>
<a href="/contact-list">
    <button>Refresh</button>
</a>
<a href="/contact-list-csv">
    <button>Export to CSV</button>
</a>
<a href="/contact-list-xml">
    <button>Export to XML</button>
</a>
<a href="/contact-list-json">
    <button>Export to JSON</button>
</a>`));
            }
        });
    })
}

export function streamableContactListPage(con: Connection): MyHttpListener {
    return (req, user) => Promise.resolve(PageResponseStream('text/html', res => {
        let i = 0;
        res.write(pageHtmlTop({user: user, title: "Contact List"}));
        res.write(`
<table>
    <thead>
        <tr>
            <th>#</th>
            ${user.admin ? `<th>Username</th>` : ``}
            <th>Submitted Time</th>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Email</th>
            <th>Subject</th>
            <th>Message</th>
            <th colspan="2">Action</th>
        </tr>
    </thead>
    <tbody>`);
        con.query(`SELECT c.*, u.username
                   FROM contact_form_submits c
                            JOIN users u on u.id = c.user_id
                       ${user.admin ? `` : `WHERE c.user_id = ?`}
                   ORDER BY c.datetime_submitted
        DESC`, user.admin ? [] : [user.id]).stream().pipe(new Transform({
            objectMode: true,
            transform(row: any, encoding: BufferEncoding, callback: TransformCallback) {
                i++;
                callback(null, `
<tr>
    <td>${i}</td>
    ${user.admin ? `<td>${xmlEscape(row.username)}</td>` : ''}
    <td>${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</td>
    <td>${xmlEscape(row.firstname)}</td>
    <td>${xmlEscape(row.lastname)}</td>
    <td>${xmlEscape(row.email)}</td>
    <td>${xmlEscape(row.subject)}</td>
    <td data-message="message cell">
        <pre>${xmlEscape(row.message)}</pre>
    </td>
    <td>
        <a href="/contact-list/${row.id}">
            <button>Edit</button>
        </a>
    </td>
    <td>
        <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
            <button>DELETE</button>
        </form>
    </td>
</tr>`)
            }
        })).on('end', () => {
            res.write(`
    </tbody>
</table>
<a href="/contact-list">
    <button>Refresh</button>
</a>
<a href="/contact-list-csv">
    <button>Export to CSV</button>
</a>
<a href="/contact-list-xml">
    <button>Export to XML</button>
</a>
<a href="/contact-list-json">
    <button>Export to JSON</button>
</a>`);
            res.end(pageHtmlBottom());
        }).pipe(res, {end: false})
    }))
}

export function uploadListPage(): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) => {
        let fileQueryHtml = '';
        fs.readdir('../uploads/', (err, files) => {
            files.forEach((file, index) => {
                fileQueryHtml += `
<tr>
    <td>${index + 1}</td>
    <td data-file-name>
        <span>${file}</span>
    </td>
    <td>
        <a href="/uploads/${file}">
            <button>Preview</button>
        </a>
    </td>
    <td>
        <a href="/uploads/${file}?download=1">
            <button>Download</button>
        </a>
    </td>
</tr>`
            });
            err ? reject(err) : resolve(pageHtmlResponse({user: user, title: "Files"}, `
<input type="text" placeholder="Search files" data-file-search="file-search">
<table>
    <thead>
    <tr>
        <th>#</th>
        <th>File Name</th>
        <th colspan="2">Actions</th>
    </tr>
    </thead>
    <tbody>
        ${fileQueryHtml}
    </tbody>
</table>
<a href="/file-list">
    <button>Refresh</button>
</a>
<a href="/download-upload-files">
    <button>Download All</button>
</a>`));
        })
    })
}