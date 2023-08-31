import {React} from "../util/react";
import {Pool} from "mysql";
import {MyHttpListener} from "../util/my-http/http-handler";
import {mysqlQuery, xmlEscape} from "../util/util";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";

export type Movie = {
    id: number;
    title: string;
    duration_minutes: number;
    production_year: number;
    description: string;
    image_url: string;
    premiere_date: Date;
    mpa: string;
}

export function movieListPage(con: Pool): MyHttpListener {
    return (req, user) => mysqlQuery<Movie>(con,
        `SELECT *
         FROM movie
         ORDER BY production_year DESC`)
        .then(results => {
            let queryToHtml = "";
            (results as any[]).forEach((row) => {
                queryToHtml +=
                    <div class="list-container">
                        <div class="top mr-btm mr-lft">
                            <a href={row.image_url}>
                                <img src={row.image_url} alt='movie image' class='movie-img'/>
                            </a>
                            <div>
                                <strong>Title: </strong>
                                <span>
                                        {xmlEscape(row.title)}
                                    </span>
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
            return pageHtmlResponse({
                title: 'Movie List', user: user, contentHtml: <div class="center-container">
                    {queryToHtml}
                    <div class="list-button-container">
                        <a href="/movie-list" class="no-underline">
                            <button class="btn">Refresh</button>
                        </a>
                    </div>
                </div>
            })
        })
}