import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {isoDateParser, mysqlQuery, streamToString} from "../../util/utility";
import * as querystring from "querystring";
import {pageHtmlResponse} from "../../util/my-http/200";
import {format as dateFormat} from "fecha";

export function addScreeningReqList(con: Connection): MyHttpListener {
    return (req, user) => streamToString(req.body).then(b => {
        const p = querystring.parse(b);
        const dateTime = isoDateParser(p.date as string);
        dateTime.setHours(parseInt(p.hour as string), parseInt(p.minute as string));
        const formattedDate = dateFormat(dateTime, `YYYY/MM/DD HH:mm`);
        return mysqlQuery(con,
            `SELECT COUNT(*) as overlapping_movies
             FROM screening s
                      JOIN movie m on m.id = s.movie_id
                      LEFT JOIN movie m_selected ON m_selected.id = ?
             WHERE screening_date <= DATE_ADD(?, INTERVAL m_selected.duration_minutes + 60 MINUTE)
               AND DATE_ADD(screening_date, INTERVAL m.duration_minutes + 60 MINUTE) >= ?
               AND s.auditorium_id = ?`,
            [p.movie, formattedDate, formattedDate, p.room])
            .then(result => {
                if (result[0]['overlapping_movies'] === 0) {
                    return mysqlQuery(con,
                        `INSERT INTO screening (movie_id, auditorium_id, screening_date)
                         VALUES (?, ?,
                                 ?)`, [p.movie, p.room, formattedDate])
                        .then(result1 => pageHtmlResponse({title: 'Success', user: user},
                            `<h1>The screening was added</h1>`)
                        )
                } else {
                    return pageHtmlResponse({title: 'Fail', user: user},
                        `<h1>Another Screening is playing at that date-time</h1>`)
                }
            })
    })
}