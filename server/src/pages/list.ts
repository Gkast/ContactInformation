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
<div class="list-container">
        <div class="top mr-btm mr-lft">
            <span><strong>Firstname: </strong> ${xmlEscape(row.firstname)}</span>
            <span><strong>Lastname: </strong> ${xmlEscape(row.lastname)}</span>
            <span><strong>Email: </strong> ${xmlEscape(row.email)}</span>
            <span><strong>Submitted Date: </strong> ${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</span>
        </div>
        <div class="body mr-btm mr-lft">
            <span><strong>Subject: </strong> ${xmlEscape(row.subject)}</span>
            <span class="mr-tp"><strong>Message: </strong> <pre>${xmlEscape(row.message)}</pre></span>
        </div>
        <div class="bottom mr-lft">
            <a href="/contact-list/${row.id}" class="no-underline mr-rgt">
                <button class="btn">Edit</button>
            </a>
            <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
                <button class="btn">DELETE</button>
            </form>
        </div>
    </div>`
                });
                resolve(pageHtmlResponse({user: user, title: "Contact List"}, `
<div class="center-container">
    <input type="text" placeholder="Search messages" class="search-list" data-contact-search>
    ${queryToHtml}
    <div class="list-button-container">
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
    </a>
    </div>
</div>`));
            }
        });
    })
}

export function streamableContactListPage(con: Connection): MyHttpListener {
    return (req, user) => Promise.resolve(PageResponseStream('text/html', res => {
        let i = 0;
        res.write(pageHtmlTop({user: user, title: "Contact List"}));
        res.write(`
<div class="center-container">
    <input type="text" placeholder="Search messages" class="search-list" data-contact-search>
`);
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
    <div class="list-container">
        <div class="top mr-btm mr-lft">
            <span><strong>Firstname: </strong> ${xmlEscape(row.firstname)}</span>
            <span><strong>Lastname: </strong> ${xmlEscape(row.lastname)}</span>
            <span><strong>Email: </strong> ${xmlEscape(row.email)}</span>
            <span><strong>Submitted Date: </strong> ${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</span>
        </div>
        <div class="body mr-btm mr-lft">
            <span><strong>Subject: </strong> ${xmlEscape(row.subject)}</span>
            <span class="mr-tp"><strong>Message: </strong> <pre>${xmlEscape(row.message)}</pre></span>
        </div>
        <div class="bottom mr-lft">
            <a href="/contact-list/${row.id}" class="no-underline mr-rgt">
                <button class="btn">Edit</button>
            </a>
            <form data-confirm-text="Are you sure?" action="/contact-list/${row.id}/delete" method="post">
                <button class="btn">DELETE</button>
            </form>
        </div>
    </div>
`)
            }
        })).on('end', () => {
            res.write(`
    <div class="list-button-container">
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
    </a>
    </div>
</div>`);
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
    <div class="list-container flx-rw">
        <span class="mr-lft">${file}</span>
        <div class="file-list-buttons mr-rgt">
            <a href="/uploads/${file}" class="no-underline mr-rgt">
                <button class="btn">Preview</button>
            </a>
            <a href="/uploads/${file}?download=1" class="no-underline">
                <button class="btn">Download</button>
            </a>
        </div>
    </div>
`
            });
            err ? reject(err) : resolve(pageHtmlResponse({user: user, title: "Files"}, `
<div class="center-container">
<input type="text" placeholder="Search files" class="search-list" data-file-search>
    ${fileQueryHtml}
<div class="list-button-container">
<a href="/file-list" class="no-underline">
    <button class="btn">Refresh</button>
</a>
<a href="/download-upload-files" class="no-underline">
    <button class="btn">Download All</button>
</a>
</div>
</div>`));
        })
    })
}