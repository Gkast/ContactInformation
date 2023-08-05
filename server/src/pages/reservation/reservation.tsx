import {React} from "../../util/react";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {mysqlQuery, rowNumberToLetter, xmlEscape} from "../../util/utility";
import {Connection} from "mysql";
import {ScreeningListSqlResult} from "../movie/screening";
import {format as dateFormat} from "fecha";

export interface AvailableSeatsSQLResult {
    id: number;
    row: number;
    number: number;
}

export function reservationPage(con: Connection): MyHttpListener {
    return (req, user) => {
        const id = decodeURIComponent(req.url.searchParams.get('id'));
        return Promise.all([
            mysqlQuery<ScreeningListSqlResult>(con,
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
                   AND s.id = ?`, [id]),
            mysqlQuery<AvailableSeatsSQLResult>(con,
                `SELECT s.id,
                        s.row,
                        s.number
                 FROM seat s
                          JOIN screening scr on s.auditorium_id = scr.auditorium_id
                 WHERE scr.id = ?
                   AND s.id NOT IN (SELECT s.id
                                    FROM seat_reserved sr
                                             JOIN seat s on s.id = sr.seat_id
                                             JOIN reservation r on r.id = sr.reservation_id
                                    WHERE sr.screening_id = ?
                                      AND r.is_cancelled = 0)`, [id, id])
        ]).then(all => {
            const screening = all[0];
            const availableSeats = all[1];
            let availableSeatsHTML = '';
            availableSeats.forEach(seat => availableSeatsHTML +=
                <option value={seat.id}>{rowNumberToLetter(seat.row)}-{seat.number}</option>)
            return pageHtmlResponse({title: `Reservation for ${screening[0].title}`, user: user},
                <div class='center-container'>
                    <form method="post" action="/reservation" class='list-container'>
                        <div class="top mr-btm mr-lft">
                            <div>
                                <strong>Title: </strong>
                                <span>{xmlEscape(screening[0].title)}</span>
                                <input name="title" value={screening[0].title} hidden/>
                            </div>
                            <br/>
                            <div>
                                <strong>Duration: </strong>
                                <span>{screening[0].duration_minutes + ' Minutes'}</span>
                                <input name="minutes" value={screening[0].duration_minutes} hidden/>
                            </div>
                            <br/>
                            <div>
                                <strong>Production Year: </strong>
                                <span>{screening[0].production_year}</span>
                                <input name="year" value={screening[0].production_year} hidden/>
                            </div>
                            <br/>
                        </div>
                        <div class="body mr-btm mr-lft">
                            <div>
                                <strong>Description: </strong>
                                <p>{screening[0].description}</p>
                                <input name="description" value={screening[0].description} hidden/>
                            </div>
                        </div>
                        <br/>
                        <div class="bottom mr-lft">
                            <div class="">
                                <div class="flx-rw">
                                    <div class="">
                                        <strong>Date: </strong>
                                        <span>{xmlEscape(dateFormat(screening[0].screening_date, 'DD/MM/YYYY HH:mm'))}</span>
                                    </div>
                                    <div class="">
                                        <strong>Room: </strong>
                                        <span>{xmlEscape(screening[0].auditorium_name)}</span>
                                    </div>
                                    <div class="">
                                        <input name="id" value={id} hidden/>
                                        <input type='text' name='name' placeholder='Enter Your Name...'
                                               class='form-input' required/>
                                    </div>
                                    <div class="">
                                        <input type='email' name='email' placeholder='Enter Your E-Mail...'
                                               class='form-input' required/>
                                    </div>
                                    {screening[0].available_seats <= 0 ?
                                        <select name='seat' class='form-input w-200px txt-bold disabled' disabled>
                                            <option value="">--Select a Seat--</option>
                                            {availableSeatsHTML}
                                        </select> :
                                        <select name='seat' class='form-input w-200px txt-bold' required>
                                            <option value="">--Select a Seat--</option>
                                            {availableSeatsHTML}
                                        </select>}
                                    {screening[0].available_seats <= 0 ?
                                        <button type="submit" class="btn mr-rgt disabled" disabled>
                                            Make Reservation
                                        </button> :
                                        <button type="submit" class="btn mr-rgt">
                                            Make Reservation
                                        </button>}
                                </div>
                            </div>
                        </div>
                    </form>
                    <a href='/screening-list'>
                        <button class='btn'>Screenings</button>
                    </a>
                </div>
            );
        });
    }
}