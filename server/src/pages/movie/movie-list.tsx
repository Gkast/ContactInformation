import {React} from "../../util/react";
import {Connection} from "mysql";
import {MyHttpListener} from "../../util/my-http/my-http";
import {xmlEscape} from "../../util/utility";
import {pageHtmlResponse} from "../../util/my-http/responses/200";

export function movieListPage(con: Connection): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) =>
        con.query(`SELECT *
                   FROM movie
                   ORDER BY production_year DESC`, [], (err, results) => {
            if (err) {
                reject(err);
                return;
            } else {
                let queryToHtml = "";
                (results as any[]).forEach((row) => {
                    queryToHtml +=
                        <div class="list-container">
                            <div class="top mr-btm mr-lft">
                                <span>
                                    <strong>Title: </strong>
                                    <span>
                                        {xmlEscape(row.title)}
                                    </span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Duration: </strong>
                                    <span>{row["duration_minutes"] + ' Minutes'}</span>
                                </span>
                                <br/><br/>
                                <span>
                                    <strong>Production Year: </strong>
                                    <span>{row["production_year"]}</span>
                                </span>
                                <br/><br/>
                            </div>
                            <div class="body mr-btm mr-lft">
                                <span>
                                    <strong>Description: </strong>
                                    <p>{xmlEscape(row.description)}</p>
                                </span>
                                <br/><br/>
                            </div>
                            {user.admin ?
                                <div class="bottom mr-lft">
                                    <a href={"/movie-list/" + row.id} class="no-underline mr-rgt">
                                        <button class="btn">Edit</button>
                                    </a>
                                    <form data-confirm-text="Are you sure?"
                                          action={"/movie-list/" + row.id + "/delete"}
                                          method="post">
                                        <button class="btn">DELETE</button>
                                    </form>
                                    <form method='get' action='/add-screening'>
                                        <input name='id' value={row.id} hidden/>
                                        <button class='btn'>Add to Screenings</button>
                                    </form>
                                </div> : ``}
                        </div>
                });
                resolve(pageHtmlResponse({title: 'Movie List', user: user},
                    <div class="center-container">
                        {queryToHtml}
                        <div class="list-button-container">
                            <a href="/movie-list" class="no-underline">
                                <button class="btn">Refresh</button>
                            </a>
                        </div>
                    </div>
                ));
            }
        })
    )
}