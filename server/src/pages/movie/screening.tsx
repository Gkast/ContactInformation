import {React} from "../../util/react";
import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {mysqlQuery, xmlEscape} from "../../util/utility";
import {format as dateFormat} from "fecha";

export interface ScreeningListSqlResult {
    id: number;
    title: string;
    duration_minutes: number;
    production_year: number;
    description: string;
    screening_id: number;
    screening_date: Date;
    auditorium_name: string;
    auditorium_seats: number;
    available_seats: number;
}

interface ScreeningListSqlResultGrouped {
    id: number;
    title: string;
    duration_minutes: number;
    production_year: number;
    description: string;
    screenings: [{
        screening_id: number;
        date: Date;
        auditorium_name: string;
        available_seats: number;
    }]
}

export function addScreeningPage(con: Connection): MyHttpListener {
    return (req, user) => mysqlQuery(con,
        `SELECT *
         FROM movie
         WHERE id = ?`, [req.url.searchParams.get('id')])
        .then(m => {
            const date = new Date();
            return pageHtmlResponse({title: 'Add Screening List', user: user},
                <form class="list-container">
                    <div class="top mr-btm mr-lft">
                        <span>
                            <strong>Title: </strong>
                            <span>
                                {xmlEscape(m[0]['title'])}
                            </span>
                        </span>
                        <br/><br/>
                        <span>
                            <strong>Duration: </strong>
                            <span>{m[0]["duration_minutes"] + ' Minutes'}</span>
                        </span>
                        <br/><br/>
                        <span>
                            <strong>Production Year: </strong>
                            <span>{m[0]["production_year"]}</span>
                        </span>
                        <br/><br/>
                    </div>
                    <div class="body mr-btm mr-lft">
                        <span>
                            <strong>Description: </strong>
                            <p>{xmlEscape(m[0]['description'])}</p>
                        </span>
                    </div>
                    <div class='bottom mr-lft'>
                        <input type='datetime-local'
                               name='screening_date'
                               value={dateFormat(date, 'YYYY-MM-DD') + 'T' + dateFormat(date, 'HH:mm')}
                               min={dateFormat(date, 'YYYY-MM-DD') + 'T' + dateFormat(date, 'HH') + ':00'}
                               max={date.getFullYear() + '-12-31T00:00'}
                               class='form-input w-200px txt-bold'
                        />
                    </div>
                </form>
            );
        })
}

export function screeningListPage(con: Connection): MyHttpListener {
    return (req, user) => mysqlQuery<ScreeningListSqlResult>(con,
        `SELECT m.*,
                s.screening_date,
                s.id                                     AS screening_id,
                a.name                                   AS auditorium_name,
                a.seats_no                               AS auditorium_seats,
                a.seats_no - COALESCE(r.booked_total, 0) AS available_seats
         FROM screening s
                  JOIN movie m on m.id = s.movie_id
                  JOIN auditorium a on s.auditorium_id = a.id
                  LEFT JOIN (SELECT COUNT(*) AS booked_total,
                                    rsv.screening_id
                             FROM reservation rsv
                             WHERE rsv.is_cancelled = 0
                             GROUP BY rsv.screening_id) AS r
                            ON r.screening_id = s.id
         WHERE s.screening_date > CURRENT_DATE
         ORDER BY s.screening_date`, []).then(screenings => {
        const movies: ScreeningListSqlResultGrouped[] = [];
        screenings.forEach(row => {
            const m = movies.find(m => m.id === row.id);
            if (m) {
                m.screenings.push({
                    screening_id: row.screening_id,
                    date: row.screening_date,
                    auditorium_name: row.auditorium_name,
                    available_seats: row.available_seats
                })
            } else {
                movies.push({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    duration_minutes: row.duration_minutes,
                    production_year: row.production_year,
                    screenings: [{
                        screening_id: row.screening_id,
                        date: row.screening_date,
                        auditorium_name: row.auditorium_name,
                        available_seats: row.available_seats
                    }]
                })
            }
        });
        return pageHtmlResponse({title: 'Screening List', user: user},
            <div class="center-container">
                {movies.map(row =>
                    <div class="list-container">
                        <div class="top mr-btm mr-lft">
                            <div>
                                <strong>Title: </strong>
                                <span>{xmlEscape(row.title)}</span>
                            </div>
                            <br/>
                            <div>
                                <strong>Duration: </strong>
                                <span>{row["duration_minutes"] + ' Minutes'}</span>
                            </div>
                            <br/>
                            <div>
                                <strong>Production Year: </strong>
                                <span>{row["production_year"]}</span>
                            </div>
                            <br/>
                        </div>
                        <div class="body mr-btm mr-lft">
                            <div>
                                <strong>Description: </strong>
                                <p>{xmlEscape(row.description)}</p>
                            </div>
                        </div>
                        <br/>
                        <div class="bottom mr-lft">
                            {row.screenings.map(s =>
                                <div class="flx-rw mr-btm">
                                    <form method="get" action="/reservation" class="flx-rw">
                                        <div class="mr-rgt">
                                            <div class="">
                                                <strong>Date: </strong>
                                                <span>{dateFormat(s.date, "DD/MM/YYYY HH:mm")}</span>
                                            </div>
                                            <div class="">
                                                <strong>Room: </strong>
                                                <span>{xmlEscape(s.auditorium_name)}</span>
                                            </div>
                                            <input name="id" value={s.screening_id} hidden/>
                                        </div>
                                        {s.available_seats <= 0 ?
                                            <div>
                                                <strong class="mr-rgt">No Available Seats</strong>
                                                <button type="submit" class="btn disabled" disabled>
                                                    Make Reservation
                                                </button>
                                            </div>
                                            :
                                            <div>
                                                <strong>Available Seats: </strong>
                                                <span class="mr-rgt">{s.available_seats}</span>
                                                <button type="submit" class="btn">
                                                    Make Reservation
                                                </button>
                                            </div>}
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>)}
                <div class="list-button-container">
                    <a href="/screening-list" class="no-underline">
                        <button class="btn">Refresh</button>
                    </a>
                </div>
            </div>
        );
    })
}