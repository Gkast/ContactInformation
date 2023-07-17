import * as http from "http";
import * as fs from "fs";
import {MyHttpListener, nodeJsToMyHttpRequest, staticFileListener, writeMyResToNodeResponse} from "./utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {
    contactDeleteListener,
    contactEditPageRequestListener,
    contactPageRequestListener,
    contactRequestListener,
    contactUpdateListener
} from "./contact";
import {registerPageRequestListener, registerRequestListener} from "./register";
import {loginPageRequestListener, loginRequestListener, logoutRequestListener} from "./login";
import {homePageRequestListener} from "./home";
import {submittedContactFormsPageRequestListener} from "./dashboard";
import {aboutPageRequestListener} from "./about";
import {redirectIfNotAuthenticated, withUserId} from "./authentication";
import {pageNotFound} from "./page";
import {uploadPageRequestListener, uploadRequestListener} from "./upload";
import {uploadedFileListPageRequestListener} from "./files";
import * as TrekRouter from 'trek-router';
import {captchaProtectedHandler} from "./captcha";

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
    http.createServer((req, res) => {
        const myReq = nodeJsToMyHttpRequest(req);
        const parsedUrl = myReq.url;
        const router = new TrekRouter();

        router.add('GET', '/about', aboutPageRequestListener());
        router.add('GET', '/contact', redirectIfNotAuthenticated(contactPageRequestListener()));
        router.add('POST', '/contact', contactRequestListener(con, smtpTransport));
        router.add('GET', '/', homePageRequestListener());
        router.add('GET', '/home', homePageRequestListener());
        router.add('GET', "/dashboard", redirectIfNotAuthenticated(submittedContactFormsPageRequestListener(con)));
        router.add('POST', '/dashboard/:id/delete', redirectIfNotAuthenticated(contactDeleteListener(con)));
        router.add('GET', '/dashboard/:id', redirectIfNotAuthenticated(contactEditPageRequestListener(con)));
        router.add('POST', '/dashboard/:id', redirectIfNotAuthenticated(contactUpdateListener(con)));
        router.add('GET', '/assets/*', staticFileListener(mimetypes));
        router.add('GET', '/uploads/*', redirectIfNotAuthenticated(staticFileListener(mimetypes)));
        router.add('POST', '/register', registerRequestListener(con));
        router.add('GET', '/register', registerPageRequestListener());
        router.add('POST', '/login', captchaProtectedHandler(captchaSecret, loginRequestListener(con)));
        router.add('GET', '/login', loginPageRequestListener());
        router.add('GET', '/logout', logoutRequestListener(con));
        router.add('GET', '/upload', redirectIfNotAuthenticated(uploadPageRequestListener()));
        router.add('POST', '/upload', redirectIfNotAuthenticated(uploadRequestListener()));
        router.add('GET', '/file-list', uploadedFileListPageRequestListener());
        router.add('GET', '*', pageNotFound);

        const handlerFoundWithParams: [MyHttpListener, any] = router.find(req.method, parsedUrl.pathname.toLowerCase())

        withUserId(con, handlerFoundWithParams[0])(myReq)
            .then(myres => writeMyResToNodeResponse(myres, res))
            .catch(err => {
                console.error(new Date(), err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.')
            })
    }).listen(3000);
});


