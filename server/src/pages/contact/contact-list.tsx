import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse, PageResponseStream} from "../../util/my-http/responses/200";
import {pageHtmlBottom, pageHtmlTop} from "../skeleton-html/skeleton";
import {Transform, TransformCallback} from "stream";
import {xmlEscape} from "../../util/utility";
import {format as dateFormat} from "fecha";
import {React} from "../../util/react";

export function contactListPage(con: Connection): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) => {
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
                (result as any[]).forEach((row) => {
                    queryToHtml +=
                        <div class="list-container">
                            <div class="top mr-btm mr-lft">
                                <span>
                                    <strong>Full Name: </strong>
                                    <span data-fullname="">
                                        {xmlEscape(row.firstname) + " " + xmlEscape(row.lastname)}
                                    </span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Email: </strong>
                                    <span data-email="">{xmlEscape(row.email)}</span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Submitted Date: </strong>
                                    <span>{dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</span>
                                </span>
                                <br/><br/>
                            </div>
                            <div class="body mr-btm mr-lft">
                                <span>
                                    <strong>Subject: </strong>
                                    <span data-subject="">{xmlEscape(row.subject)}</span>
                                </span>
                                <br/><br/>
                                <span class="mr-tp">
                                    <strong>Message: </strong>
                                </span>
                                <p data-message="">{xmlEscape(row.message)}</p>
                            </div>
                            <div class="bottom mr-lft">
                                <a href={"/contact-list/" + row.id} class="no-underline mr-rgt">
                                    <button class="btn">Edit</button>
                                </a>
                                <form data-confirm-text="Are you sure?" action={"/contact-list/" + row.id + "/delete"}
                                      method="post">
                                    <button class="btn">DELETE</button>
                                </form>
                            </div>
                        </div>
                });
                resolve(pageHtmlResponse({user: user, title: "Contact List"},
                    <div class="center-container">
                        <input type="text" placeholder="Search messages" class="search-list" data-contact-search=""/>
                        {queryToHtml}
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
                    </div>));
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
                                <span>
                                    <strong>Full Name: </strong>
                                    <span data-fullname="">${xmlEscape(row.firstname) + " " + xmlEscape(row.lastname)}</span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Email: </strong>
                                    <span data-email="">${xmlEscape(row.email)}</span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Submitted Date: </strong>
                                    <span>${dateFormat(row.datetime_submitted, 'DD/MM/YYYY HH:mm:ss')}</span>
                                </span>
                                <br/><br/>
                            </div>
                            <div class="body mr-btm mr-lft">
                                <span>
                                    <strong>Subject: </strong>
                                    <span data-subject="">${xmlEscape(row.subject)}</span>
                                </span>
                                <br/><br/>
                                <span class="mr-tp">
                                    <strong>Message: </strong>
                                </span>
                                <p data-message="">${xmlEscape(row.message)}</p>
                            </div>
                            <div class="bottom mr-lft">
                                <a href=${"/contact-list/" + row.id} class="no-underline mr-rgt">
                                    <button class="btn">Edit</button>
                                </a>
                                <form data-confirm-text="Are you sure?" action=${"/contact-list/" + row.id + "/delete"}
                                      method="post">
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