import * as http from "http";
import {staticFileReqList} from "./util/utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {adminHandler, authHandler, withUserId} from "./util/auth/authentication";
import * as TrekRouter from 'trek-router';
import {HttpRouter, MyHttpListener, getHttpStatusMessage} from "./util/my-http/my-http";
import {myResToNodeRes, nodeReqToMyReq} from "./util/my-http/req-res-converter";
import {initializeGracefulShutdown} from "./util/graceful-shutdown";
import {mimeType} from "./util/mime-types";
import {downloadUploadedFilesReqList, uploadFileReqList} from "./tools/file-req-list";
import {uploadListPage} from "./tools/file-list";
import {uploadFilePage} from "./tools/upload-file";
import {imgResizeReqList} from "./tools/img-resize-req-list";
import {imgResizePage} from "./tools/img-resize";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "./tools/csv";
import {
    cancelReservationReqList,
    cancelReservationTokenReqList,
    changeSeatReqList, reservationReqList
} from "./cinema/reservation/reservation-req-list";
import {changeSeatPage} from "./cinema/reservation/change-seat";
import {cancelReservationPage} from "./cinema/reservation/cancel-reservation";
import {reservationCheckPage, reservationCheckReqList} from "./cinema/reservation/check-reservation";
import {reservationPage} from "./cinema/reservation/reservation";
import {screeningListPage} from "./cinema/screening/screening-list";
import {addScreeningReqList} from "./cinema/screening/screening-req-list";
import {addScreeningPage} from "./cinema/screening/add-screening";
import {addMovieReqList, deleteMovieReqList, editMovieReqList} from "./movies/movie-req-list";
import {addMoviePage, movieEditPage} from "./movies/movie";
import {movieListPage} from "./movies/movie-list";
import {exportCSVContactsReqList, exportJSONContactsReqList, exportXMLContactsReqList} from "./contact/export-contacts";
import {contactDeleteReqList, contactEditReqList, contactReqList} from "./contact/contact-req-list";
import {contactEditPage, contactPage} from "./contact/contact";
import {contactListPage, streamableContactListPage} from "./contact/contact-list";
import {pageNotFoundResponse} from "./util/my-http/client-error-response";
import {
    changePasswordReqList, loginReqList,
    logoutReqList,
    recoveryTokenGeneratorReqList,
    registerReqList
} from "./main/client-auth/client-auth";
import {changePasswordPage, forgotPasswordPage, recoveryTokenVerificationPage} from "./main/client-auth/reset-password";
import {loginPage} from "./main/client-auth/login";
import {captchaProtectedHandler} from "./util/auth/captcha";
import {registerPage} from "./main/client-auth/register";
import {hotelDetailsPage} from "./main/hotel-details";
import {aboutPage} from "./main/about";
import {homePage} from "./main/home";
import * as winston from "winston";
import {createLogger} from "./util/logger";

// Initialize the Winston logger
export const logger = createLogger(process.env.LOG_LEVEL || 'info');

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => logger.error(`Unhandled Rejection: ${reason}`, {
    promise: promise,
    reason: reason
}));
process.on('uncaughtException', (err) => logger.error(`Uncaught Exception: ${err}`, {
    message: err.message,
    stack: err.stack
}));

logger.info(`Process initiated with id: ${process.pid}`);

// Initialize SMTP transport for sending emails
const smtpTransport = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false
});

// Create a MySQL connection
const con = mysql.createConnection(process.env.MYSQL_CONN_STRING);

// Connect to the database and start the server
new Promise((resolve, reject) => con.connect(err => {
    if (err) {
        logger.error(`Error connecting to database ${err}`, {message: err.message, stack: err.stack});
        reject(err);
    } else {
        logger.info("Connected to MySQL database");
        resolve(con);
    }
})).then(() => {
    const captchaSecret = process.env.CAPTCHA_SECRET;

    // Router setup and route definitions
    const router: HttpRouter<MyHttpListener> = new TrekRouter();

    // Main App
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
    router.add('GET', '/assets/*', staticFileReqList());
    router.add('GET', '*', () => Promise.resolve(pageNotFoundResponse()));

    // Contact App
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

    // Movie App
    router.add('GET', '/add-movie', adminHandler(addMoviePage()));
    router.add('POST', '/add-movie', adminHandler(addMovieReqList(con)));
    router.add('GET', '/movie-list', authHandler(movieListPage(con)));
    router.add('POST', '/movie-list/:id/delete', adminHandler(deleteMovieReqList(con)));
    router.add('GET', '/movie-list/:id', adminHandler(movieEditPage(con)));
    router.add('POST', '/movie-list/:id', adminHandler(editMovieReqList(con)));
    router.add('GET', '/add-screening', adminHandler(addScreeningPage(con)));
    router.add('POST', '/add-screening', adminHandler(addScreeningReqList(con)));

    // Cinema App
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


    // Tools App
    router.add('GET', "/csv", testCSVReqList(con));
    router.add('GET', "/csv-stream", TestCSVStreamReqList(con));
    router.add('GET', "/csv-stream-pipe", TestCSVStreamPipeReqList(con));
    router.add('GET', '/img-resize-page', imgResizePage());
    router.add('GET', '/img-resize', imgResizeReqList());
    router.add('GET', '/uploads/*', authHandler(staticFileReqList()));
    router.add('GET', '/upload-file', authHandler(uploadFilePage()));
    router.add('POST', '/upload-file', authHandler(uploadFileReqList()));
    router.add('GET', '/file-list', authHandler(uploadListPage()));
    router.add('GET', '/download-upload-files', downloadUploadedFilesReqList());

    logger.info("Router initialized");

    // Create an HTTP server
    const server = http.createServer((req, res) => {
        const myReq = nodeReqToMyReq(req);
        const parsedUrl = myReq.url;
        const handlerFound = router.find(req.method, parsedUrl.pathname.toLowerCase());

        if (!handlerFound || !handlerFound[0]) {
            res.statusCode = 405;
            res.setHeader('Content-Type', mimeType("pl"));
            res.end('Method not found')
            return;
        }


        withUserId(con, handlerFound[0])(myReq)
            .then(myRes => myResToNodeRes(myRes, res))
            .catch(err => {
                logger.error('An unexpected error occurred', {
                    url: req.url,
                    headers: req.headers,
                    message: err.message,
                    stack: err.stack
                });
                res.statusCode = 500;
                res.statusMessage = getHttpStatusMessage(res.statusCode);
                res.setHeader('Content-Type', mimeType("pl"));
                res.end('An unexpected error occurred');
            })
    })

    // Start the server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        logger.info('Server initialized');
        logger.info(`Server listening on port ${port}`);
        const timeoutMs = 10000;
        initializeGracefulShutdown(server, con, timeoutMs);
    })

    // Setting a timeout for keep-alive connections
    server.keepAliveTimeout=30000;

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
        logger.error(`Server error code: ${error.code}`, {message: error.message, stack: error.stack});
        if (error.code === 'EACCES') {
            logger.error(`Server error code: ${error.code}. Bind ${port} requires elevated privileges`, {
                message: error.message,
                stack: error.stack
            });
        } else if (error.code === 'EADDRINUSE') {
            logger.error(`Server error code: ${error.code}. Port ${port} is already in use`, {
                message: error.message,
                stack: error.stack
            });
        } else {
            logger.error(`Server error code: ${error.code}`, {message: error.message, stack: error.stack});
        }
        process.exit(1);
    })

    // Handle client errors
    server.on('clientError', (err, socket) => {
        logger.error(`Client error: ${err}`, {message: err.message, stack: err.stack});
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
});