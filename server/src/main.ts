import * as http from "http";
import * as fs from "fs";
import {MyHttpListener, pageNotFound, staticFileListener, writeMyResToNodeResponse} from "./utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {
    contactDeleteListener,
    contactEditPageListener,
    contactPageRequestListener,
    contactRequestListener,
    contactUpdateListener
} from "./contact";
import {registerPageRequestListener, registerRequestListener} from "./register";
import {loginPageRequestListener, loginRequestListener, logout} from "./login";
import {homeRequestListener} from "./home";
import {submittedContactFormsRequestListener} from "./dashboard";
import {aboutPageRequestListener} from "./about";
import {redirectIfNotAuthenticated, withUserId} from "./auth";

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

    const aboutPageHandler = aboutPageRequestListener();
    const contactHandler = contactRequestListener(con, smtpTransport);
    const contactPageHandler = contactPageRequestListener();
    const staticFileHandler = staticFileListener(mimetypes);
    const homePageHandler = homeRequestListener();
    const submittedContactFormsHandler = submittedContactFormsRequestListener(con);
    const contactDeleteHandler = contactDeleteListener(con);
    const contactUpdateHandler = contactUpdateListener(con);
    const contactEditPageHandler = contactEditPageListener(con);
    const registerHandler = registerRequestListener(con);
    const registerPageHandler = registerPageRequestListener();
    const loginHandler = loginRequestListener(con);
    const loginPageHandler = loginPageRequestListener();
    const logoutHandler = logout(con);


    http.createServer((req, res) => {
        const parsedUrl = new URL('http://' + req.headers.host + req.url);
        const pathLowerCase = parsedUrl.pathname.toLowerCase();
        const method = req.method;
        const pageParams: Object = {
            path: parsedUrl.pathname.toLowerCase(),
            method: req.method
        }
        const handlerFound: MyHttpListener =
            pathLowerCase === '/about' && method === 'GET' ? aboutPageHandler :
                pathLowerCase === '/contact' && method === 'POST' ? contactHandler :
                    pathLowerCase === '/contact' && method === 'GET' ? redirectIfNotAuthenticated(contactPageHandler) :
                        (pathLowerCase === "/" || pathLowerCase === "/home") && method === "GET" ? homePageHandler :
                            pathLowerCase === "/dashboard" && method === "GET" ? redirectIfNotAuthenticated(submittedContactFormsHandler) :
                                pathLowerCase.match(/^\/dashboard\/\d+\/delete$/) && method === "POST" ? redirectIfNotAuthenticated(contactDeleteHandler) :
                                    pathLowerCase.match(/^\/dashboard\/\d+$/) && method === "GET" ? redirectIfNotAuthenticated(contactEditPageHandler) :
                                        pathLowerCase.match(/^\/dashboard\/\d+$/) && method === "POST" ? redirectIfNotAuthenticated(contactUpdateHandler) :
                                            pathLowerCase.startsWith('/assets/') && method === "GET" ? staticFileHandler :
                                                pathLowerCase === '/register' && method === 'POST' ? registerHandler :
                                                    pathLowerCase === '/register' && method === 'GET' ? registerPageHandler :
                                                        pathLowerCase === '/login' && method === 'POST' ? loginHandler :
                                                            pathLowerCase === '/login' && method === 'GET' ? loginPageHandler :
                                                                pathLowerCase === '/logout' && method === 'GET' ? logoutHandler :
                                                                    pageNotFound;


        withUserId(con, handlerFound)(req, parsedUrl)
            .then(myres => writeMyResToNodeResponse(myres, res))
            .catch(err => {
                console.error(new Date(), err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.')
            })
    }).listen(3000);
});


