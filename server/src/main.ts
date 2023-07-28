import * as http from "http";
import * as fs from "fs";
import {staticFileReqList} from "./util/utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {contactDeleteReqList, contactEditPage, contactEditReqList, contactPage, contactReqList} from "./pages/contact";
import {registerPage, registerReqList} from "./pages/register";
import {loginPage, loginReqList, logoutReqList} from "./pages/login";
import {homePage} from "./pages/home";
import {contactListPage, streamableContactListPage, uploadListPage} from "./pages/list";
import {aboutPage} from "./pages/about";
import {authHandler, withUserId} from "./auth/authentication";
import {uploadFilePage, uploadFileReqList} from "./pages/upload-file";
import * as TrekRouter from 'trek-router';
import {captchaProtectedHandler} from "./auth/captcha";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "./util/export/csv";
import {
    exportCSVContactsReqList,
    exportJSONContactsReqList,
    exportXMLContactsReqList
} from "./util/export/export-contacts";
import {hotelDetailsPage} from "./pages/hotel-details";
import {
    changePasswordPage,
    changePasswordReqList,
    forgotPasswordPage,
    recoveryTokenVerificationPage
} from "./pages/reset-password";
import {recoveryTokenGeneratorReqList} from "./util/recovery/recovery-token";
import {HttpRouter, MyHttpListener, myResToNodeRes, nodeReqToMyHttpReq} from "./util/my-http/my-http";
import {imgResizePage, imgResizeReqList} from "./pages/img-resize";
import {downloadUploadFilesReqList} from "./util/compress/compress";
import {pageNotFoundResponse} from "./util/my-http/responses/400";

const smtpTransport = nodemailer.createTransport({
    host: "localhost",
    port: 25,
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
    router.add('POST', '/contact', contactReqList(con, smtpTransport));
    router.add('GET', '/', homePage());
    router.add('GET', '/home', homePage());
    router.add('GET', "/contact-list", authHandler(contactListPage(con)));
    router.add('GET', "/contact-list-stream", authHandler(streamableContactListPage(con)));
    router.add('POST', '/contact-list/:id/delete', authHandler(contactDeleteReqList(con)));
    router.add('GET', '/contact-list/:id', authHandler(contactEditPage(con)));
    router.add('POST', '/contact-list/:id', authHandler(contactEditReqList(con)));
    router.add('GET', "/contact-list-csv", authHandler(exportCSVContactsReqList(con)));
    router.add('GET', "/contact-list-xml", authHandler(exportXMLContactsReqList(con)));
    router.add('GET', "/contact-list-json", authHandler(exportJSONContactsReqList(con)));
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
    router.add('GET', '/download-upload-files', downloadUploadFilesReqList());
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


