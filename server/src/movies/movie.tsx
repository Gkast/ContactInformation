import {React} from "../util/react";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/200";
import {Connection} from "mysql";
import {pageNotFoundResponse} from "../util/my-http/400";
import {mysqlQuery, xmlEscape} from "../util/utility";
import {format as dateFormat} from "fecha";
import {Movie} from "./movie-list";

export function addMoviePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({title: 'Add Movie', user: user},
        <div class="center-container">
            <form method="post" action="/add-movie" class="form-container">
                <input type="text" placeholder="Title" name="title" required/>
                <input type="number" placeholder="Duration in Minutes" name="duration" required/>
                <input type="number" placeholder="Production Year" name="production-year" required/>
                <input type='url' placeholder="Image Url" name="image-url" required/>
                <input type="date" placeholder="Premiere Date" name="premiere-date" required/>
                <select name='mpa' required>
                    <option value=''>Select MPA</option>
                    <option value='G'>G</option>
                    <option value='PG'>PG</option>
                    <option value='PG-13'>PG-13</option>
                    <option value='R'>R</option>
                    <option value='NC-17'>NC-17</option>
                    <option value='NR'>NR</option>
                </select>
                <textarea placeholder="Description" name="description" required></textarea>
                <div class="form-button-container">
                    <button type="submit" class="btn">Submit Movie</button>
                </div>
            </form>
        </div>
    ))
}

export function movieEditPage(con: Connection): MyHttpListener {
    return (req, user) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        if (!id) {
            return Promise.resolve(pageNotFoundResponse())
        }
        return mysqlQuery<Movie>(con,
            `SELECT *
             FROM movie
             WHERE id = ?`, [id]).then(results => {
            const selectHtml = `<select name='mpa' required>
                                    <option value='G' ${results[0]['mpa'] === 'G' ? 'selected' : ''}>G</option>
                                    <option value='PG' ${results[0]['mpa'] === 'PG' ? 'selected' : ''}>PG</option>
                                    <option value='PG-13' ${results[0]['mpa'] === 'PG-13' ? 'selected' : ''}>PG-13</option>
                                    <option value='R' ${results[0]['mpa'] === 'R' ? 'selected' : ''}>R</option>
                                    <option value='NC-17' ${results[0]['mpa'] === 'NC-17' ? 'selected' : ''}>NC-17</option>
                                    <option value='NR' ${results[0]['mpa'] === 'NR' ? 'selected' : ''}>NR</option>
                                    <option value='NR' ${results[0]['mpa'] === 'NR' ? 'selected' : ''}>NR</option>
                                </select>`
            if (!results[0]) {
                return pageNotFoundResponse()
            }
            return pageHtmlResponse({user: user, title: "Edit Contact"},
                <div class="center-container">
                    <form method="post" action={"/movie-list/" + results[0].id} class="form-container">
                        <input type="text" placeholder="Title" name="title" required
                               value={xmlEscape(results[0].title)}/>
                        <input type="number" placeholder="Duration Minutes" name="duration" required
                               value={results[0]['duration_minutes']}/>
                        <input type="number" placeholder="Production Year" name="production-year" required
                               value={results[0]['production_year']}/>
                        <input type="url" placeholder="Image Url" name="image-url" required
                               value={results[0]['image_url']}/>
                        <input type="date" placeholder="Premiere Date" name="email" required
                               value={dateFormat(results[0]['premiere_date'], 'YYYY-MM-DD')}/>
                        {selectHtml}
                        <textarea placeholder="Description" name="description" required>
                                    {xmlEscape(results[0].description)}
                                </textarea>
                        <button type="submit" class="btn">Change Contact Form</button>
                    </form>
                </div>
            )
        })
    }
}