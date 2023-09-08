import {MyHttpListener} from "../util/my-http/http-handler";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {React} from "../util/react";

export function homePage(): MyHttpListener {
    return async (req, user) => pageHtmlResponse({
        user: user, title: "Home", contentHtml: <div class="center-container">
            <div class="article-message">
                <h1>Home</h1>
                {user ? <span class="user">Welcome {user.username}</span> : ''}
            </div>

            <div class="ul-container">
                <ul class="nv-home-links">
                    <h1>Main App</h1>
                    <li class="home-li li-tp-br">
                        <a href="/about" class="no-underline">
                            <span>About us</span>
                        </a>
                    </li>
                    <li class="home-li li-btm-br">
                        <a href="/hotel-details-page" class="no-underline">
                            <span>Hotel Details</span>
                        </a>
                    </li>
                </ul>
                <br/><br/>

                {user ?
                    <ul class="nv-home-links">
                        <h1>Contact App</h1>
                        <li class="home-li li-tp-br">
                            <a href="/contact" class="no-underline">
                                <span>Contact</span>
                            </a>
                        </li>
                        <li class="home-li">
                            <a href="/contact-list" class="no-underline">
                                <span>Contact List</span>
                            </a>
                        </li>
                        <li class="home-li li-btm-br">
                            <a href="/contact-list-stream" class="no-underline">
                                <span>Contact List Stream</span>
                            </a>
                        </li>
                    </ul> : ``}
                <br/><br/>

                {user ?
                    <ul class="nv-home-links">
                        <h1>Movie App</h1>
                        <li class={"home-li" + (user.admin ? " li-tp-br" : "")}>
                            <a href="/movie-list" class="no-underline">
                                <span>Movie List</span>
                            </a>
                        </li>
                        {user.admin ?
                            <li class={"home-li" + (user.admin ? " li-btm-br" : "")}>
                                <a href="/add-movie" class="no-underline">
                                    <span>Add Movie</span>
                                </a>
                            </li> : ``}
                    </ul> : ``}
                <br/><br/>

                <ul class="nv-home-links">
                    <h1>Cinema App</h1>
                    <li class="home-li li-tp-br">
                        <a href="/screening-list" class="no-underline">
                            <span>Screening List</span>
                        </a>
                    </li>
                    <li class="home-li li-btm-br">
                        <a href="/reservation-check" class="no-underline">
                            <span>Check Reservation</span>
                        </a>
                    </li>
                </ul>
                <br/><br/>

                <ul class="nv-home-links">
                    <h1>Tools App</h1>
                    <li class="home-li li-tp-br">
                        <a href="/csv" class="no-underline">
                            <span>Export CSV Test</span>
                        </a>
                    </li>
                    <li class="home-li">
                        <a href="/csv-stream" class="no-underline">
                            <span>Export CSV Stream Test</span>
                        </a>
                    </li>
                    <li class="home-li">
                        <a href="/csv-stream-pipe" class="no-underline">
                            <span>Export CSV Stream Pipe Test</span>
                        </a>
                    </li>
                    <li class={"home-li" + (!user ? " li-btm-br" : "")}>
                        <a href="/img-resize-page" class="no-underline">
                            <span>Image Resizer</span>
                        </a>
                    </li>
                    {user ?
                        <div>
                            <li class="home-li">
                                <a href="/upload-file" class="no-underline">
                                    <span>Upload File</span>
                                </a>
                            </li>
                            <li class="home-li li-btm-br">
                                <a href="/file-list" class="no-underline">
                                    <span>File List</span>
                                </a>
                            </li>
                        </div> : ``}
                </ul>
            </div>
        </div>
    })
}