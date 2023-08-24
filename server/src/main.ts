import * as http from "http";
import * as fs from "fs";
import {staticFileReqList} from "./util/utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {contactDeleteReqList, contactEditReqList, contactReqList} from "./contact/contact-req-list";
import {homePage} from "./main/home";
import {aboutPage} from "./main/about";
import {adminHandler, authHandler, withUserId} from "./util/auth/authentication";
import * as TrekRouter from 'trek-router';
import {captchaProtectedHandler} from "./util/auth/captcha";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "./tools/csv";
import {exportCSVContactsReqList, exportJSONContactsReqList, exportXMLContactsReqList} from "./contact/export-contacts";
import {hotelDetailsPage} from "./main/hotel-details";
import {HttpRouter, MyHttpListener, MyHttpRequest} from "./util/my-http/my-http";
import {imgResizeReqList} from "./tools/img-resize-req-list";
import {pageNotFoundResponse} from "./util/my-http/400";
import {contactListPage, streamableContactListPage} from "./contact/contact-list";
import {uploadListPage} from "./tools/file-list";
import {loginPage} from "./main/client-auth/login";
import {registerPage} from "./main/client-auth/register";
import {changePasswordPage, forgotPasswordPage, recoveryTokenVerificationPage} from "./main/client-auth/reset-password";
import {contactEditPage, contactPage} from "./contact/contact";
import {imgResizePage} from "./tools/img-resize";
import {uploadFilePage} from "./tools/upload-file";
import {addMoviePage, movieEditPage} from "./movies/movie";
import {addMovieReqList, deleteMovieReqList, editMovieReqList} from "./movies/movie-req-list";
import {movieListPage} from "./movies/movie-list";
import {screeningListPage} from "./cinema/screening/screening-list";
import {reservationPage} from "./cinema/reservation/reservation";
import {
    cancelReservationReqList,
    cancelReservationTokenReqList,
    changeSeatReqList,
    reservationReqList
} from "./cinema/reservation/reservation-req-list";
import {reservationCheckPage, reservationCheckReqList} from "./cinema/reservation/check-reservation";
import {cancelReservationPage} from "./cinema/reservation/cancel-reservation";
import {changeSeatPage} from "./cinema/reservation/change-seat";
import {addScreeningReqList} from "./cinema/screening/screening-req-list";
import {myResToNodeRes, nodeReqToMyReq} from "./util/my-http/req-res-converter";
import {addScreeningPage} from "./cinema/screening/add-screening";
import {
    changePasswordReqList,
    loginReqList,
    logoutReqList,
    recoveryTokenGeneratorReqList,
    registerReqList
} from "./main/client-auth/client-auth";
import {downloadUploadedFilesReqList, uploadFileReqList} from "./tools/file-req-list";
import {HttpMethod, MyRouter} from "./util/my-http/my-router";
import {Connection} from "mysql";

console.log(`Process id: ${process.pid}`);

const smtpTransport = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false
});

const con = mysql.createConnection(process.env.MYSQL_CONN_STRING);

Promise.all([
    fs.promises.readFile('../misc/mimetypes.json', {encoding: 'utf-8'}).then(fileContents => {
        console.log("Mimetypes.json has been read");
        return new Map<string, string>(Object.entries(JSON.parse(fileContents)));
    }),
    new Promise((resolve, reject) => con.connect(err => {
        if (err) {
            reject(err);
        } else {
            console.log("Connected to database");
            resolve(con);
        }
    }))
]).then(all => {
    const mimetypes = all[0];
    const captchaSecret = process.env['CAPTCHA_SECRET'];
    const router: HttpRouter<MyHttpListener> = new TrekRouter();

    console.log("Initializing router");

    //Main App
    router.add('GET', '/', homePage());
    router.add('GET', '/home', homePage());
    router.add('GET', '/about', aboutPage());
    router.add('GET', '/hotel-details-page', hotelDetailsPage());
    router.add('POST', '/register', captchaProtectedHandler(captchaSecret, registerReqList(con)));
    router.add('GET', '/register', registerPage());
    router.add('POST', '/login', captchaProtectedHandler(captchaSecret, loginReqList(con)));
    router.add('GET', '/login', loginPage());
    router.add('POST', '/logout', logoutReqList(con));
    router.add('GET', '/forgot-password', forgotPasswordPage());
    router.add('POST', '/token-generator', recoveryTokenGeneratorReqList(con, smtpTransport));
    router.add('GET', '/token-verify', recoveryTokenVerificationPage());
    router.add('GET', '/change-password', changePasswordPage());
    router.add('POST', '/change-password', changePasswordReqList(con));

    //Contact App
    router.add('GET', '/contact', authHandler(contactPage()));
    router.add('POST', '/contact', authHandler(contactReqList(con, smtpTransport)));
    router.add('GET', "/contact-list", authHandler(contactListPage(con)));
    router.add('GET', "/contact-list-stream", authHandler(streamableContactListPage(con)));
    router.add('POST', '/contact-list/:id/delete', authHandler(contactDeleteReqList(con)));
    router.add('GET', '/contact-list/:id', authHandler(contactEditPage(con)));
    router.add('POST', '/contact-list/:id', authHandler(contactEditReqList(con)));
    router.add('GET', "/contact-list-csv", authHandler(exportCSVContactsReqList(con)));
    router.add('GET', "/contact-list-xml", authHandler(exportXMLContactsReqList(con)));
    router.add('GET', "/contact-list-json", authHandler(exportJSONContactsReqList(con)));

    //Movie App
    router.add('GET', '/add-movie', adminHandler(addMoviePage()));
    router.add('POST', '/add-movie', adminHandler(addMovieReqList(con)));
    router.add('GET', '/movie-list', authHandler(movieListPage(con)));
    router.add('POST', '/movie-list/:id/delete', adminHandler(deleteMovieReqList(con)));
    router.add('GET', '/movie-list/:id', adminHandler(movieEditPage(con)));
    router.add('POST', '/movie-list/:id', adminHandler(editMovieReqList(con)));
    router.add('GET', '/add-screening', adminHandler(addScreeningPage(con)));
    router.add('POST', '/add-screening', adminHandler(addScreeningReqList(con)));

    //Cinema App
    router.add('GET', '/screening-list', screeningListPage(con));
    router.add('GET', '/reservation', reservationPage(con));
    router.add('POST', '/reservation', reservationReqList(con, smtpTransport));
    router.add('GET', '/reservation-check', reservationCheckPage());
    router.add('POST', '/reservation-check', reservationCheckReqList(con));
    router.add('POST', '/cancel-reservation-token', cancelReservationTokenReqList(con, smtpTransport));
    router.add('GET', '/cancel-reservation', cancelReservationPage());
    router.add('POST', '/cancel-reservation', cancelReservationReqList(con));
    router.add('POST', '/change-seat-reservation-page', changeSeatPage(con));
    router.add('POST', '/change-seat-reservation', changeSeatReqList(con));


    //Tools App
    router.add('GET', "/csv", testCSVReqList(con));
    router.add('GET', "/csv-stream", TestCSVStreamReqList(con));
    router.add('GET', "/csv-stream-pipe", TestCSVStreamPipeReqList(con));
    router.add('GET', '/img-resize-page', imgResizePage());
    router.add('GET', '/img-resize', imgResizeReqList());
    router.add('GET', '/assets/*', staticFileReqList(mimetypes));
    router.add('GET', '/uploads/*', authHandler(staticFileReqList(mimetypes)));
    router.add('GET', '/upload-file', authHandler(uploadFilePage()));
    router.add('POST', '/upload-file', authHandler(uploadFileReqList()));
    router.add('GET', '/file-list', authHandler(uploadListPage()));
    router.add('GET', '/download-upload-files', downloadUploadedFilesReqList());

    router.add('GET', '*', () => Promise.resolve(pageNotFoundResponse()));

    console.log("Router initialized");

    const server = http.createServer((req, res) => {
        const myReq = nodeReqToMyReq(req);
        const parsedUrl = myReq.url;
        const handlerFound = router.find(req.method, parsedUrl.pathname.toLowerCase())

        if (!handlerFound || !handlerFound[0]) {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Method not found.')
            return;
        }

        withUserId(con, handlerFound[0])(myReq)
            .then(myRes => myResToNodeRes(myRes, res))
            .catch(err => {
                console.error(new Date(), req.url, req.headers, err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.');
            })
    }).listen(3000, () => console.log("Listening on 3000"));

    let isShuttingDown = false;

    function initiateGracefulShutdown() {
        if (!isShuttingDown) {
            isShuttingDown = true;
            console.log("Initiating graceful shutdown...");
            server.close(() => {
                console.log("Server closed. No longer accepting connections.");
                console.log("Performing cleanup tasks...");
                con.end(() => console.log("Gracefully shutting down connection database..."));
                console.log("Cleanup tasks completed.");
                process.exit(0);
            });
            setTimeout(() => {
                console.error("Forcing server to close after timeout...");
                process.exit(1);
            }, 10000);
        }
    }

    process.on('unhandledRejection', (reason) => {
        console.error(new Date(), reason);
    });

    process.on("SIGINT", () => {
        console.log("SIGINT received...");
        initiateGracefulShutdown();
    });

    process.on("SIGTERM", () => {
        console.log("SIGTERM received...");
        initiateGracefulShutdown();
    });
});


