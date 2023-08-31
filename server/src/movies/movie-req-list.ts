import {Pool} from "mysql";
import {MyHttpListener} from "../util/my-http/http-handler";
import {isoDateParser, mysqlQuery, streamToString} from "../util/util";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {redirectResponse} from "../util/my-http/responses/redirect-response";
import {pageNotFoundResponse} from "../util/my-http/responses/client-error-response";
import {format as dateFormat} from "fecha";

export function addMovieReqList(con: Pool): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        return mysqlQuery(con,
            `INSERT INTO movie (title, duration_minutes, production_year, image_url, premiere_date, mpa,
                                description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [p['title'], p['duration'], p['production-year'], p['image-url'],
                dateFormat(isoDateParser(p['premiere-date'] as string), 'YYYY/MM/DD'), p['mpa'], p.description])
            .then(result => pageHtmlResponse({title: 'Success', user: user,contentHtml:`
<div>
    <h1>The Movie Was Added Successfully</h1>
    <p>The Movie ID:${result['insertId']}</p>
    <a href="/home" class="no-underline">
        <button class="btn">Home</button>
    </a>                
</div>`}))
    })
}

export function deleteMovieReqList(con: Pool): MyHttpListener {
    return (req) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (id) {
            return mysqlQuery(con,
                `DELETE
                 FROM movie
                 WHERE id = ?`)
                .then(result => redirectResponse('/movie-list'))
        }
    }
}

export function editMovieReqList(con: Pool): MyHttpListener {
    return (req, user) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        return !id ? Promise.resolve(pageNotFoundResponse()) : streamToString(req.body).then(bodyString => {
            const p = querystring.parse(bodyString);
            return mysqlQuery(con,
                `UPDATE movie
                 SET title            = ?,
                     duration_minutes = ?,
                     production_year  = ?,
                     image_url        = ?,
                     premiere_date    = ?,
                     mpa              = ?,
                     description      = ?
                 WHERE id = ?`, [p.title, p.duration, p['production-year'], p['image-url'],
                    dateFormat(isoDateParser(p['premiere-date'] as string), 'YYYY/MM/DD'), p['mpa'],
                    p.description, id])
                .then(result => redirectResponse('/contact-list'))
        });
    }
}