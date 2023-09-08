import {React} from "../../util/react";
import {Pool} from "mysql";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {mysqlQuery, xmlEscape} from "../../util/util";
import {format as dateFormat} from "fecha";

export type ScreeningListSqlResult = {
    id: number;
    title: string;
    duration_minutes: number;
    production_year: number;
    description: string;
    image_url: string;
    screening_id: number;
    screening_date: Date;
    auditorium_name: string;
    auditorium_seats: number;
    available_seats: number;
}

export type ScreeningListSqlResultGrouped = {
    id: number;
    title: string;
    duration_minutes: number;
    production_year: number;
    description: string;
    image_url: string;
    screenings: [{
        screening_id: number;
        date: Date;
        auditorium_name: string;
        available_seats: number;
    }]
}

export function screeningListPage(con: Pool): MyHttpListener {
    return async (req, user) => {
        const screenings = await mysqlQuery<ScreeningListSqlResult>(con,
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
             WHERE s.screening_date > CURRENT_TIMESTAMP
             ORDER BY s.screening_date`, []);
        const movies: ScreeningListSqlResultGrouped[] = [];
        screenings.forEach(row => {
            const m = movies.find(m_1 => m_1.id === row.id);
            if (m) {
                m.screenings.push({
                    screening_id: row.screening_id,
                    date: row.screening_date,
                    auditorium_name: row.auditorium_name,
                    available_seats: row.available_seats
                });
            } else {
                movies.push({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    duration_minutes: row.duration_minutes,
                    production_year: row.production_year,
                    image_url: row.image_url,
                    screenings: [{
                        screening_id: row.screening_id,
                        date: row.screening_date,
                        auditorium_name: row.auditorium_name,
                        available_seats: row.available_seats
                    }]
                });
            }
        });
        return pageHtmlResponse({
            title: 'Screening List', user: user, contentHtml: <div class="center-container">
                {movies.map(row_1 => <div class="list-container">
                    <div class="top mr-btm mr-lft">
                        <a href={row_1.image_url}>
                            <img src={row_1.image_url} alt='movie image' class='movie-img'/>
                        </a>
                        <div>
                            <strong>Title: </strong>
                            <span>{xmlEscape(row_1.title)}</span>
                        </div>
                        <br/>
                        <div>
                            <strong>Duration: </strong>
                            <span>{row_1["duration_minutes"] + ' Minutes'}</span>
                        </div>
                        <br/>
                        <div>
                            <strong>Production Year: </strong>
                            <span>{row_1["production_year"]}</span>
                        </div>
                        <br/>
                    </div>
                    <div class="body mr-btm mr-lft">
                        <div>
                            <strong>Description: </strong>
                            <p>{xmlEscape(row_1.description)}</p>
                        </div>
                    </div>
                    <br/>
                    <div class="bottom mr-lft">
                        {row_1.screenings.map(s => <div class="flx-rw mr-btm">
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
        });
    }
}