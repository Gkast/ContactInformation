import * as http from "http";
import * as fs from "fs";
import {staticFileReqList} from "./util/utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {contactDeleteReqList, contactEditReqList, contactReqList} from "./pages/contact/contact-req-list";
import {registerReqList} from "./pages/client-auth/register-req-list";
import {loginReqList, logoutReqList} from "./pages/client-auth/login-req-list";
import {homePage} from "./pages/home/home";
import {aboutPage} from "./pages/about/about";
import {adminHandler, authHandler, withUserId} from "./auth/authentication";
import {uploadFileReqList} from "./pages/upload-file/upload-file-req-list";
import * as TrekRouter from 'trek-router';
import {captchaProtectedHandler} from "./auth/captcha";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "./util/export/csv";
import {
    exportCSVContactsReqList,
    exportJSONContactsReqList,
    exportXMLContactsReqList
} from "./util/export/export-contacts";
import {hotelDetailsPage} from "./pages/hotel-details/hotel-details";
import {changePasswordReqList} from "./pages/client-auth/reset-password-req-list";
import {recoveryTokenGeneratorReqList} from "./util/token/recovery-token";
import {HttpRouter, MyHttpListener, myResToNodeRes, nodeReqToMyHttpReq} from "./util/my-http/my-http";
import {imgResizeReqList} from "./pages/img-resize/img-resize-req-list";
import {downloadUploadFilesReqList} from "./util/compress/compress";
import {pageNotFoundResponse} from "./util/my-http/responses/400";
import {contactListPage, streamableContactListPage} from "./pages/contact/contact-list";
import {uploadListPage} from "./pages/upload-file/file-list";
import {loginPage} from "./pages/client-auth/login";
import {registerPage} from "./pages/client-auth/register";
import {
    changePasswordPage,
    forgotPasswordPage,
    recoveryTokenVerificationPage
} from "./pages/client-auth/reset-password";
import {contactEditPage, contactPage} from "./pages/contact/contact";
import {imgResizePage} from "./pages/img-resize/img-resize";
import {uploadFilePage} from "./pages/upload-file/upload-file";
import {movieEditPage, moviePage} from "./pages/movie/movie";
import {movieDeleteReqList, movieEditReqList, movieReqList} from "./pages/movie/movie-req-list";
import {movieListPage} from "./pages/movie/movie-list";
import {addScreeningPage, screeningListPage} from "./pages/movie/screening";
import {reservationPage} from "./pages/reservation/reservation";
import {reservationReqList} from "./pages/reservation/reservation-req-list";
import {reservationCheckPage, reservationCheckReqList} from "./pages/reservation/check/reservation-check";
import {cancelReservationPage} from "./pages/reservation/cancel/cancel-reservation";
import {cancelReservationTokenReqList} from "./util/token/cancel-reservation-token";
import {cancelReservationReqList} from "./pages/reservation/cancel/cancel-reservation-req-list";
import {changeSeatPage} from "./pages/reservation/change-seat/change-seat";
import {changeSeatReqList} from "./pages/reservation/change-seat/change-seat-req-list";
import {addScreeningReqList} from "./pages/movie/screening-req-list";

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

    router.add('GET', '/about', aboutPage());

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


    router.add('GET', '/', homePage());
    router.add('GET', '/home', homePage());

    router.add('GET', "/csv", testCSVReqList(con));
    router.add('GET', "/csv-stream", TestCSVStreamReqList(con));
    router.add('GET', "/csv-stream-pipe", TestCSVStreamPipeReqList(con));

    router.add('GET', '/hotel-details-page', hotelDetailsPage());

    router.add('GET', '/img-resize-page', imgResizePage());
    router.add('GET', '/img-resize', imgResizeReqList());

    router.add('GET', '/assets/*', staticFileReqList(mimetypes));
    router.add('GET', '/uploads/*', authHandler(staticFileReqList(mimetypes)));

    router.add('POST', '/register', captchaProtectedHandler(captchaSecret, registerReqList(con)));
    router.add('GET', '/register', registerPage());

    router.add('POST', '/login', captchaProtectedHandler(captchaSecret, loginReqList(con)));
    router.add('GET', '/login', loginPage());

    router.add('POST', '/logout', logoutReqList(con));

    router.add('GET', '/upload-file', authHandler(uploadFilePage()));
    router.add('POST', '/upload-file', authHandler(uploadFileReqList()));

    router.add('GET', '/file-list', authHandler(uploadListPage()));

    router.add('GET', '/forgot-password', forgotPasswordPage());
    router.add('POST', '/token-generator', recoveryTokenGeneratorReqList(con, smtpTransport));
    router.add('GET', '/token-verify', recoveryTokenVerificationPage());
    router.add('GET', '/change-password', changePasswordPage());
    router.add('POST', '/change-password', changePasswordReqList(con));

    router.add('POST', '/cancel-reservation-token', cancelReservationTokenReqList(con, smtpTransport));
    router.add('GET', '/cancel-reservation', cancelReservationPage());
    router.add('POST', '/cancel-reservation', cancelReservationReqList(con));

    router.add('POST', '/change-seat-reservation-page', changeSeatPage(con));
    router.add('POST', '/change-seat-reservation', changeSeatReqList(con));

    router.add('GET', '/download-upload-files', downloadUploadFilesReqList());

    router.add('GET', '/add-movie', adminHandler(moviePage()));
    router.add('POST', '/add-movie', adminHandler(movieReqList(con)));

    router.add('GET', '/add-screening', adminHandler(addScreeningPage(con)));
    router.add('POST', '/add-screening', adminHandler(addScreeningReqList(con)));

    router.add('GET', '/movie-list', authHandler(movieListPage(con)));
    router.add('POST', '/movie-list/:id/delete', adminHandler(movieDeleteReqList(con)));
    router.add('GET', '/movie-list/:id', adminHandler(movieEditPage(con)));
    router.add('POST', '/movie-list/:id', adminHandler(movieEditReqList(con)));

    router.add('GET', '/screening-list', screeningListPage(con));

    router.add('GET', '/reservation', reservationPage(con));
    router.add('POST', '/reservation', reservationReqList(con, smtpTransport));

    router.add('GET', '/reservation-check', reservationCheckPage());
    router.add('POST', '/reservation-check', reservationCheckReqList(con));

    router.add('GET', '*', () => Promise.resolve(pageNotFoundResponse()));

    console.log("Router initialized");

    http.createServer((req, res) => {
        const myReq = nodeReqToMyHttpReq(req);
        const parsedUrl = myReq.url;
        const handlerFound = router.find(req.method, parsedUrl.pathname.toLowerCase())

        if (!handlerFound) {
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not found page.')
            return;
        }

        withUserId(con, handlerFound[0])(myReq)
            .then(myRes => myResToNodeRes(myRes, res))
            .catch(err => {
                console.error(new Date(), err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.')
            })
    }).listen(3000);
    console.log("Listening on 3000");
});


