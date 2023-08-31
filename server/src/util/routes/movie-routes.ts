import {MyHttpListener} from "../my-http/http-handler";
import {Pool} from "mysql";
import {adminHandler, authHandler} from "../../auth/authentication";
import {addMoviePage, movieEditPage} from "../../movies/movie";
import {addMovieReqList, deleteMovieReqList, editMovieReqList} from "../../movies/movie-req-list";
import {movieListPage} from "../../movies/movie-list";
import {addScreeningPage} from "../../cinema/screening/screening-add";
import {addScreeningReqList} from "../../cinema/screening/screening-req-list";
import {HttpRouter} from "../config/router-config";

export async function setupMovieRoutes(router: HttpRouter<MyHttpListener>, dbPool: Pool): Promise<void> {
    router.add('GET', '/add-movie', adminHandler(addMoviePage()));
    router.add('POST', '/add-movie', adminHandler(addMovieReqList(dbPool)));
    router.add('GET', '/movie-list', authHandler(movieListPage(dbPool)));
    router.add('POST', '/movie-list/:id/delete', adminHandler(deleteMovieReqList(dbPool)));
    router.add('GET', '/movie-list/:id', adminHandler(movieEditPage(dbPool)));
    router.add('POST', '/movie-list/:id', adminHandler(editMovieReqList(dbPool)));
    router.add('GET', '/add-screening', adminHandler(addScreeningPage(dbPool)));
    router.add('POST', '/add-screening', adminHandler(addScreeningReqList(dbPool)));
}