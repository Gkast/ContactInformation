import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {redirectResponse} from "../../util/my-http/responses/300";
import {pageNotFoundResponse} from "../../util/my-http/responses/400";

export function movieReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return new Promise((resolve, reject) => {
            con.query(`INSERT INTO movie (title, duration_minutes, production_year, description)
                       VALUES (?, ?, ?, ?)`,
                [p.title, p.duration, p['production-year'], p.description],
                (err, results) => err ? reject(err) : resolve(pageHtmlResponse({title: 'Success', user: user}, `
<div>
    <h1>The Movie Was Added Successfully</h1>
    <p>The Movie ID:${results.insertId}</p>
    <a href="/home" class="no-underline">
        <button class="btn">Home</button>
    </a>                
</div>
                `)))
        })
    })
}

export function movieDeleteReqList(con: Connection): MyHttpListener {
    return (req) => new Promise((resolve, reject) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (id)
            con.query("DELETE FROM movie WHERE id=?", [id], (err) =>
                err ? reject(err) : resolve(redirectResponse('/movie-list')))
    })
}

export function movieEditReqList(con: Connection): MyHttpListener {
    return (req) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        return !id ? Promise.resolve(pageNotFoundResponse()) : streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return new Promise((resolve, reject) =>
                con.query(`UPDATE movie
                           SET title            = ?,
                               duration_minutes = ?,
                               production_year  = ?,
                               description      = ?
                           WHERE id = ?`, [p.title, p.duration, p['production_year'], p.description, id], err =>
                    err != null ? reject(err) : resolve(redirectResponse('/contact-list'))));
        });
    }
}