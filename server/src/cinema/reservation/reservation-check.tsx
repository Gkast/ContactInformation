import {React} from "../../util/react";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {Pool} from "mysql";
import {mysqlQuery, rowNumberToLetter, streamToString, xmlEscape} from "../../util/util";
import * as querystring from "querystring";
import {format as dateFormat} from "fecha";

export function reservationCheckPage(): MyHttpListener {
    return async (req, user) => pageHtmlResponse({
        title: 'Check Reservation',
        user: user,
        contentHtml: <div class='center-container'>
            <form method='post' action='/reservation-check' class='form-container'>
                <input name='reservation_id' placeholder='Enter Reservation ID...' required/>
                <button class='btn'>Check Reservation</button>
            </form>
        </div>
    })
}

export function reservationCheckReqList(con: Pool): MyHttpListener {
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const p = querystring.parse(bodyString);
        const s = await mysqlQuery(con,
            `SELECT m.*,
                    s.screening_date,
                    s.id   AS screening_id,
                    a.name AS auditorium_name,
                    r.reserved_by
             FROM screening s
                      JOIN movie m on m.id = s.movie_id
                      JOIN auditorium a on s.auditorium_id = a.id
                      JOIN reservation r on s.id = r.screening_id
             WHERE r.id = ?`, [p['reservation_id']]);
        const sr = await mysqlQuery(con,
            `SELECT sr.id as seat_res_id, s.id, s.row, s.number
             FROM seat_reserved sr
                      JOIN seat s on s.id = sr.seat_id
             WHERE sr.reservation_id = ?
               AND sr.is_cancelled = 0`, [p['reservation_id']]);
        return s.length === 0 ?
            pageHtmlResponse({
                title: 'Wrong Reservation ID',
                user: user,
                contentHtml: `<h1>Wrong Reservation ID</h1>`
            })
            : pageHtmlResponse({
                title: 'Your Reservation', user: user, contentHtml: <div class='center-container'>
                    <div class='list-container'>
                        <div class="top mr-btm mr-lft">
                            <a href={s[0].image_url}>
                                <img src={s[0].image_url} alt='movie image' class='movie-img'/>
                            </a>
                            <div>
                                <strong>Title: </strong>
                                <span>{xmlEscape(s[0].title)}</span>
                            </div>
                        </div>
                        <br/>
                        <div class="bottom mr-lft">
                            <div class="flx-rw">
                                <div class="flx-rw">
                                    <div class="mr-rgt">
                                        <strong>Date: </strong>
                                        <span>{xmlEscape(dateFormat(s[0].screening_date, 'DD/MM/YYYY HH:mm'))}</span>
                                    </div>
                                    <div class="mr-rgt">
                                        <strong>Room:</strong>
                                        <span>{xmlEscape(s[0].auditorium_name)}</span>
                                    </div>
                                    <div class="mr-rgt">
                                        <strong>Reserved Seat: </strong>
                                        <span>{rowNumberToLetter(sr[0].row)}-{sr[0].number}</span>
                                    </div>
                                    <div class="mr-rgt">
                                        <strong>Reserved By:</strong>
                                        <span>{xmlEscape(s[0].reserved_by)}</span>
                                    </div>
                                    <form method="post"
                                          action="/cancel-reservation-token">
                                        <input type="text" name='id' value={xmlEscape(p['reservation_id'][0])}
                                               hidden/>
                                        <button type="submit" class="btn mr-rgt">Cancel Reservation</button>
                                    </form>
                                    <form method='post' action='/change-seat-reservation-page'>
                                        <input type="text" name='id' value={xmlEscape(p['reservation_id'][0])}
                                               hidden/>
                                        <input type='text' name='seatid' value={sr[0]['seat_res_id']} hidden/>
                                        <button type="submit" class='btn'>Change Seat</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            });
    }
}