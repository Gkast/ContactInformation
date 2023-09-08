import {Pool} from "mysql";
import {MyHttpListener} from "../../util/my-http/http-handler";
import {intRange, mysqlQuery, xmlEscape} from "../../util/util";
import {pageHtmlResponse} from "../../util/my-http/responses/successful-response";
import {format as dateFormat} from "fecha";
import {React} from "../../util/react";
import {Movie} from "../../movies/movie-list";

export function addScreeningPage(con: Pool): MyHttpListener {
    return async (req, user) => {
        const movie = await mysqlQuery<Movie>(con,
            `SELECT *
             FROM movie
             WHERE id = ?`, [req.url.searchParams.get('id')]);
        const rooms = await mysqlQuery(con,
            `SELECT id, name
             FROM auditorium`);
        const date = movie[0].premiere_date > new Date() ? movie[0].premiere_date : new Date();
        let hours = '';
        let minutes = '';
        intRange(0, 24, 1).forEach(value => hours +=
            <option value={value}>{value < 10 ? '0' + value : value}</option>
        );
        intRange(0, 12, 5).forEach(value_1 => minutes +=
            <option value={value_1}>{value_1 < 10 ? '0' + value_1 : value_1}</option>
        );
        const hoursHTML = <select name='hour' class='form-input w-200px txt-bold mr-rgt' required>
            <option value=''>Select Hour</option>
            {hours}
        </select>;
        const minutesHTML = <select name='minute' class='form-input w-200px txt-bold mr-rgt' required>
            <option value=''>--Select minute--</option>
            {minutes}
        </select>;
        let roomName = '';
        rooms.forEach(row => roomName += <option value={row.id}>{row.name}</option>);
        const roomNameHTML = <select name={'room'} class={"form-input w-200px txt-bold"} required>
            <option value={""}>Select room</option>
            {roomName}
        </select>;
        return pageHtmlResponse({
            title: 'Add Screening List',
            user: user,
            contentHtml: <form method='post' action='/server/src/cinema/screening/screening-add'
                               class="list-container">
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
                           required/>
                    {hoursHTML}
                    {minutesHTML}
                    {roomNameHTML}
                    <button type={'submit'} class={'btn mr-lft'}>Add Screening</button>
                </div>
            </form>
        });
    }
}