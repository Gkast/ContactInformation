import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {intRange, mysqlQuery, xmlEscape} from "../../util/utility";
import {pageHtmlResponse} from "../../util/my-http/successful-response";
import {format as dateFormat} from "fecha";
import {React} from "../../util/react";
import {Movie} from "../../movies/movie-list";

export function addScreeningPage(con: Connection): MyHttpListener {
    return (req, user) => Promise.all([
        mysqlQuery<Movie>(con,
            `SELECT *
             FROM movie
             WHERE id = ?`, [req.url.searchParams.get('id')]),
        mysqlQuery(con, `SELECT id, name
                         FROM auditorium`)
    ]).then(all => {
        const movie = all[0];
        const rooms = all[1];
        const date = movie[0].premiere_date > new Date() ? movie[0].premiere_date : new Date();
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

        return pageHtmlResponse({
            title: 'Add Screening List',
            user: user,
            contentHtml: <form method='post' action='/add-screening' class="list-container">
                <div class="top mr-btm mr-lft">
                    <a href={movie[0].image_url}>
                        <img src={movie[0].image_url} alt='movie image' class='movie-img'/>
                    </a>
                    <div>
                        <strong>Title: </strong>
                        <span>
                                {xmlEscape(movie[0]['title'])}
                            </span>
                    </div>
                    <br/><br/>
                    <div>
                        <strong>Duration: </strong>
                        <span>{movie[0]["duration_minutes"] + ' Minutes'}</span>
                    </div>
                    <br/><br/>
                    <div>
                        <strong>Production Year: </strong>
                        <span>{movie[0]["production_year"]}</span>
                    </div>
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
        });
    })
}