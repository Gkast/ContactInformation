import {React} from "../../util/react";
import {Pool} from "mysql";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {mysqlQuery, rowNumberToLetter, streamToString, xmlEscape} from "../../util/util";
import * as querystring from "querystring";
import {AvailableSeatsSQLResult} from "./reservation";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {format as dateFormat} from "fecha";
import {pageNotFoundResponse} from "../../util/my-http/responses/client-error-response";

export function changeSeatPage(con: Pool): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const p = querystring.parse(bodyString);
        const previousSeatId = p.seatid;
        return Promise.all([
            mysqlQuery(con,
                `SELECT m.*,
                        s.screening_date,
                        s.id   AS screening_id,
                        a.name AS auditorium_name,
                        r.reserved_by
                 FROM screening s
                          JOIN movie m on m.id = s.movie_id
                          JOIN auditorium a on s.auditorium_id = a.id
                          JOIN reservation r on s.id = r.screening_id
                 WHERE r.id = ?`, [p.id]),
            mysqlQuery<AvailableSeatsSQLResult>(con,
                `SELECT s.id,
                        s.row,
                        s.number
                 FROM seat s
                          JOIN screening scr on s.auditorium_id = scr.auditorium_id
                 WHERE scr.id = (SELECT screening_id FROM reservation WHERE id = ?)
                   AND s.id NOT IN (SELECT s.id
                                    FROM seat_reserved sr
                                             JOIN seat s on s.id = sr.seat_id
                                             JOIN reservation r on r.id = sr.reservation_id
                                    WHERE sr.screening_id = (SELECT screening_id FROM reservation WHERE id = ?)
                                      AND r.is_cancelled = 0
                                      AND sr.is_cancelled = 0)`, [p.id, p.id])
        ]).then(all => {
            const screening = all[0];
            const availableSeats = all[1];
            let availableSeatsHTML = '';
            availableSeats.forEach(seat => availableSeatsHTML +=
                <option value={seat.id[0]}>{rowNumberToLetter(seat.row)}-{seat.number}</option>)
            return pageHtmlResponse({
                title: 'Change Seat', user: user, contentHtml: <div class='center-container'>
                    <form method="post" action="/change-seat-reservation" class='list-container'>
                        <div class="top mr-btm mr-lft">
                            <a href={screening[0].image_url}>
                                <img src={screening[0].image_url} alt='movie image' class='movie-img'/>
                            </a>
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
                                    <input name='previous_seat' value={previousSeatId} hidden/>
                                    <input name='scr_id' value={screening[0].screening_id} hidden/>
                                    <input name='res_id' value={p.id} hidden/>
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
                </div>
            })
        })
    })
}