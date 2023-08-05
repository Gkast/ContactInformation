import {React} from "../../util/react";
import {MyHttpListener} from "../../util/my-http/my-http";
import {pageHtmlResponse} from "../../util/my-http/responses/200";
import {Connection} from "mysql";
import {pageNotFoundResponse} from "../../util/my-http/responses/400";
import {xmlEscape} from "../../util/utility";

export function moviePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({title: 'Add Movie', user: user},
        <div class="center-container">
            <form method="post" action="/add-movie" class="form-container">
                <input type="text" placeholder="Title" name="title" required/>
                <input type="number" placeholder="Duration in Minutes" name="duration" required/>
                <input type="number" placeholder="Production Year" name="production-year" required/>
                <textarea placeholder="Description" name="description" required></textarea>
                <div class="form-button-container">
                    <button type="submit" class="btn">Submit Movie</button>
                </div>
            </form>
        </div>
    ))
}

export function movieEditPage(con: Connection): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) => {
        const id = parseInt(req.url.pathname.split('/')[2], 10);
        !id ? resolve(pageNotFoundResponse()) :
            con.query("SELECT * FROM movie WHERE id=?", [id], (err, results) =>
                err ? reject(err) : !results[0] ? resolve(pageNotFoundResponse()) :
                    resolve(pageHtmlResponse({user: user, title: "Edit Contact"},
                        <div class="center-container">
                            <form method="post" action={"/movie-list/" + results[0].id} class="form-container">
                                <input type="text" placeholder="Title" name="title" required
                                       value={xmlEscape(results[0].title)}/>
                                <input type="number" placeholder="Duration Minutes" name="duration" required
                                       value={results[0]['duration_minutes']}/>
                                <input type="number" placeholder="Production Year" name="email" required
                                       value={results[0]['production_year']}/>
                                <textarea placeholder="Description" name="description" required>
                                    {xmlEscape(results[0].description)}
                                </textarea>
                                <button type="submit" class="btn">Change Contact Form</button>
                            </form>
                        </div>
                    )));
    })
}