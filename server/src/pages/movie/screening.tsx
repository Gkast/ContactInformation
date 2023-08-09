import {React} from "../../util/react";
import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {intRange, mysqlQuery, xmlEscape} from "../../util/utility";
import {format as dateFormat} from "fecha";

export interface ScreeningListSqlResult {
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

export interface ScreeningListSqlResultGrouped {
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

export function addScreeningPage(con: Connection): MyHttpListener {
    return (req, user) => Promise.all([
        mysqlQuery(con,
            `SELECT *
             FROM movie
             WHERE id = ?`, [req.url.searchParams.get('id')]),
        mysqlQuery(con, `SELECT id, name
                         FROM auditorium`)
    ]).then(all => {
        const movie = all[0];
        const rooms = all[1];

        const date = new Date();
        let hours = '';
        let minutes = '';
        intRange(0, 24, 1).forEach(value => hours +=
            <option value={value}>{value < 10 ? '0' + value : value}</option>
        );
        intRange(0, 12, 5).forEach(value => minutes +=
            <option value={value}>{value < 10 ? '0' + value : value}</option>
        );
        const hoursHTML =
            <select name='hour' class='form-input w-200px txt-bold mr-rgt' required>
                <option value=''>Select Hour</option>
                {hours}
            </select>;
        const minutesHTML =
            <select name='minute' class='form-input w-200px txt-bold mr-rgt' required>
                <option value=''>--Select minute--</option>
                {minutes}
            </select>;

        let roomName = '';
        rooms.forEach(row => roomName += <option value={row.id}>{row.name}</option>);
        const roomNameHTML =
            <select name={'room'} class={"form-input w-200px txt-bold"} required>
                <option value={""}>Select room</option>
                {roomName}
            </select>

        return pageHtmlResponse({title: 'Add Screening List', user: user},
            <form method='post' action='/add-screening' class="list-container">
                <div class="top mr-btm mr-lft">
                        <span>
                            <strong>Title: </strong>
                            <span>
                                {xmlEscape(movie[0]['title'])}
                            </span>
                        </span>
                    <br/><br/>
                    <span>
                            <strong>Duration: </strong>
                            <span>{movie[0]["duration_minutes"] + ' Minutes'}</span>
                        </span>
                    <br/><br/>
                    <span>
                            <strong>Production Year: </strong>
                            <span>{movie[0]["production_year"]}</span>
                        </span>
                    <br/><br/>
                </div>
                <div class="body mr-btm mr-lft">
                        <span>
                            <strong>Description: </strong>
                            <p>{xmlEscape(movie[0]['description'])}</p>
                        </span>
                </div>
                <div class='bottom mr-lft'>
                    <input name={'movie'} value={movie[0].id} hidden/>
                    <input type='date'
                           name='date'
                           value={dateFormat(date, 'YYYY-MM-DD')}
                           min={dateFormat(date, 'YYYY-MM-DD')}
                           max={date.getFullYear() + '-12-31'}
                           class='form-input w-200px txt-bold mr-rgt'
                           required
                    />
                    {hoursHTML}
                    {minutesHTML}
                    {roomNameHTML}
                    <button type={'submit'} class={'btn mr-lft'}>Add Screening</button>
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
         WHERE s.screening_date > CURRENT_TIMESTAMP
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
                    image_url: row.image_url,
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
                            <img src={row.image_url} alt='movie image' width='240px' height='360px'/>
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