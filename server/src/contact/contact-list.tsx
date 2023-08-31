import {Pool} from "mysql";
import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse, pageResponseStream} from "../util/my-http/responses/successful-response";
import {htmlBottomPageTemplate, htmlTopPageTemplate} from "../util/my-http/responses/html-template";
import {Transform, TransformCallback} from "stream";
import {mysqlQuery, xmlEscape} from "../util/util";
import {format as dateFormat} from "fecha";
import {React} from "../util/react";
import {pageNotFoundResponse} from "../util/my-http/responses/client-error-response";

export function contactListPage(con: Pool): MyHttpListener {
    return (req, user) => {
        const filter = req.url.searchParams.get('search-filter');
        let sqlCondition = [];
        let filterSQLCondition = '';
        if (filter) {
            const searchFilter = filter.replace(`'`, ``).trim().split(" ");
            searchFilter.forEach(value =>
                sqlCondition.push(`(c.firstname LIKE '%${value}%' OR c.lastname LIKE '%${value}%' OR 
                    c.email LIKE '%${value}%' OR c.subject LIKE '%${value}%' OR c.message LIKE '%${value}%')`));
            filterSQLCondition = sqlCondition.join(" AND ")
        }
        return mysqlQuery(con,
            `SELECT c.*, u.username
             FROM contact_form_submits c
                      JOIN users u on u.id = c.user_id
                 ${user.admin ? `${filter ? `WHERE ` + filterSQLCondition : ``}` :
                         `WHERE c.user_id = ? ${filter ? ("AND " + filterSQLCondition) : ''}`}
             ORDER BY c.datetime_submitted
            DESC`, user.admin ? [] : [user.id])
            .then(results => {
                let queryToHtml = "";
                (results as any[]).forEach((row) => {
                    queryToHtml +=
                        <div class="list-container">
                            <div class="top mr-btm mr-lft">
                                    <span>
                                        <strong>Full Name: </strong>
                                        <span>
                                            {xmlEscape(row.firstname) + " " + xmlEscape(row.lastname)}
                                        </span>
                                    </span>
                                <br/><br/>
                                <span>
                                        <strong>Email: </strong>
                                        <span>{xmlEscape(row.email)}</span>
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
                                        <span>{xmlEscape(row.subject)}</span>
                                    </span>
                                <br/><br/>
                                <span class="mr-tp">
                                        <strong>Message: </strong>
                                    </span>
                                <p>{xmlEscape(row.message)}</p>
                            </div>
                            <div class="bottom mr-lft">
                                <a href={"/contact-list/" + row.id} class="no-underline mr-rgt">
                                    <button class="btn">Edit</button>
                                </a>
                                <form data-confirm-text="Are you sure?"
                                      action={"/contact-list/" + row.id + "/delete"}
                                      method="post">
                                    <button class="btn">DELETE</button>
                                </form>
                            </div>
                        </div>
                });
                return pageHtmlResponse({user: user, title: "Contact List",contentHtml:<div class="center-container">
                        <form method="get" action="/contact-list" class="flx-rw w-80 flx-al-it-str">
                            <input type="text" name="search-filter" placeholder="Search contacts"
                                   class="search-list"/>
                            <button type="submit" class="btn">Search</button>
                        </form>
                        {queryToHtml}
                        <div class="list-button-container">
                            <a href="/server/src/contact/contact-list" class="no-underline">
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
                    </div>})
            })
    }
}

export function streamableContactListPage(con: Pool): MyHttpListener {
    return (req, user) => Promise.resolve(pageResponseStream('text/html', res => {
        let i = 0;
        res.write(htmlTopPageTemplate({user: user, title: "Contact List"}));
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
            res.end(htmlBottomPageTemplate());
        }).pipe(res, {end: false})
    }))
}