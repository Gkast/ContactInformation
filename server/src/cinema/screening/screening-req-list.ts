import {Pool} from "mysql";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {isoDateParser, mysqlQuery, streamToString} from "../../util/util";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {format as dateFormat} from "fecha";

export function addScreeningReqList(con: Pool): MyHttpListener {
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        const dateTime = isoDateParser(p.date as string);
        dateTime.setHours(parseInt(p.hour as string), parseInt(p.minute as string));
        const formattedDate = dateFormat(dateTime, `YYYY/MM/DD HH:mm`);
        const result = await mysqlQuery(con,
            `SELECT COUNT(*) as overlapping_movies
             FROM screening s
                      JOIN movie m on m.id = s.movie_id
                      LEFT JOIN movie m_selected ON m_selected.id = ?
             WHERE screening_date <= DATE_ADD(?, INTERVAL m_selected.duration_minutes + 60 MINUTE)
               AND DATE_ADD(screening_date, INTERVAL m.duration_minutes + 60 MINUTE) >= ?
               AND s.auditorium_id = ?`,
            [p.movie, formattedDate, formattedDate, p.room]);
        if (result[0]['overlapping_movies'] === 0) {
            await mysqlQuery(con,
                `INSERT INTO screening (movie_id, auditorium_id, screening_date)
                 VALUES (?, ?,
                         ?)`, [p.movie, p.room, formattedDate])
            return pageHtmlResponse({
                title: 'Success',
                user: user,
                contentHtml: `<h1>The screening was added</h1>`
            })
        } else {
            return pageHtmlResponse({
                title: 'Fail',
                user: user,
                contentHtml: `<h1>Another Screening is playing at that date-time</h1>`
            });
        }
    }
}