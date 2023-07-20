import * as http from "http";
import * as fs from "fs";
import {staticFileReqList} from "./util/utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {contactDeleteHandler, contactEditHandler, contactEditPage, contactHandler, contactPage} from "./page/contact";
import {registerHandler, registerPage} from "./page/register";
import {loginHandler, loginPage, logoutHandler} from "./page/login";
import {homePage} from "./page/home";
import {contactListPage, uploadsPage} from "./page/list";
import {aboutPage} from "./page/about";
import {authHandler, withUserId} from "./authentication/authentication";
import {pageNotFound} from "./page/skeleton-page/page";
import {uploadHandler, uploadPageReqList} from "./page/upload";
import * as TrekRouter from 'trek-router';
import {captchaProtectedHandler} from "./authentication/captcha";
import {testCSV, TestCSVStream, TestCSVStreamPipe} from "./export/csv";
import {exportCSVContacts, exportJSONContacts, exportXMLContacts} from "./export/export";
import {hotelDetailsPage} from "./page/hotel-details";
import {
    changePassword,
    changePasswordPage,
    forgotPasswordPage
} from "./page/reset-password";
import {recoveryTokenGenerator, recoveryTokenVerificationPage} from "./util/recovery-token";
import {MyHttpListener, nodeJsToMyHttpRequest, writeMyResToNodeResponse} from "./util/my-http";

const smtpTransport = nodemailer.createTransport({
    host: "localhost",
    port: 25,
    secure: false
});

const con = mysql.createConnection(process.env.MYSQL_CONN_STRING);

Promise.all([
    fs.promises.readFile('../misc/mimetypes.json', {encoding: 'utf-8'}).then(
        fileContents => new Map<string, string>(Object.entries(JSON.parse(fileContents)))),
    new Promise((resolve, reject) => con.connect(err => {
        if (err) {
            reject(err);
        } else {
            resolve(con);
        }
    })),
]).then(all => {
    const mimetypes = all[0];
    const captchaSecret = process.env['CAPTCHA_SECRET'];
    const router = new TrekRouter();

    router.add('GET', '/about', aboutPage());
    router.add('GET', '/contact', authHandler(contactPage()));
    router.add('POST', '/contact', contactHandler(con, smtpTransport));
    router.add('GET', '/', homePage());
    router.add('GET', '/home', homePage());
    router.add('GET', "/contact-list", authHandler(contactListPage(con)));
    router.add('POST', '/contact-list/:id/delete', authHandler(contactDeleteHandler(con)));
    router.add('GET', '/contact-list/:id', authHandler(contactEditPage(con)));
    router.add('POST', '/contact-list/:id', authHandler(contactEditHandler(con)));
    router.add('GET', "/contact-list-csv", authHandler(exportCSVContacts(con)));
    router.add('GET', "/contact-list-xml", authHandler(exportXMLContacts(con)));
    router.add('GET', "/contact-list-json", authHandler(exportJSONContacts(con)));
    router.add('GET', "/csv", testCSV(con));
    router.add('GET', "/csv-stream", TestCSVStream(con));
    router.add('GET', "/csv-stream-pipe", TestCSVStreamPipe(con));
    router.add('GET', '/hotel-details-page', hotelDetailsPage());
    router.add('GET', '/assets/*', staticFileReqList(mimetypes));
    router.add('GET', '/uploads/*', authHandler(staticFileReqList(mimetypes)));
    router.add('POST', '/register', captchaProtectedHandler(captchaSecret, registerHandler(con)));
    router.add('GET', '/register', registerPage());
    router.add('POST', '/login', captchaProtectedHandler(captchaSecret, loginHandler(con)));
    router.add('GET', '/login', loginPage());
    router.add('POST', '/logout', logoutHandler(con));
    router.add('GET', '/upload', authHandler(uploadPageReqList()));
    router.add('POST', '/upload', authHandler(uploadHandler()));
    router.add('GET', '/file-list', uploadsPage());
    router.add('GET', '/forgot-password', forgotPasswordPage());
    router.add('GET', '/forgot-password', forgotPasswordPage());
    router.add('POST', '/token-generator', recoveryTokenGenerator(con, smtpTransport));
    router.add('GET', '/token-verify', recoveryTokenVerificationPage());
    router.add('GET', '/change-password', changePasswordPage());
    router.add('POST', '/change-password', changePassword(con));
    router.add('GET', '*', pageNotFound);

    http.createServer((req, res) => {
        const myReq = nodeJsToMyHttpRequest(req);
        const parsedUrl = myReq.url;
        const handlerFound: [MyHttpListener, any] = router.find(req.method, parsedUrl.pathname.toLowerCase())

        if (!handlerFound) {
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not found page.')
            return;
        }
        withUserId(con, handlerFound[0])(myReq)
            .then(myRes => writeMyResToNodeResponse(myRes, res))
            .catch(err => {
                console.error(new Date(), err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.')
            })
    }).listen(3000);
});


