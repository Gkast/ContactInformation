import * as http from "http";
import * as fs from "fs";
import {MyHttpListener, staticFileListener, writeMyResToNodeResponse} from "./utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {
    contactDeleteListener,
    contactEditPageListener,
    contactPageRequestListener,
    contactRequestListener,
    contactUpdateListener
} from "./contact";
import {defaultListener} from "./handler-default";
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

    const defaultHandler = defaultListener();
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
        const handlerFound: MyHttpListener =
            pathLowerCase === '/about' && req.method === 'GET' ? aboutPageHandler :
                pathLowerCase === '/contact' && req.method === 'POST' ? contactHandler :
                    pathLowerCase === '/contact' && req.method === 'GET' ? contactPageHandler :
                        (pathLowerCase === "/" || pathLowerCase === "/home") && req.method === "GET" ? homePageHandler :
                            pathLowerCase === "/form-dashboard" && req.method === "GET" ? redirectIfNotAuthenticated(submittedContactFormsHandler) :
                                pathLowerCase.match(/^\/form-dashboard\/\d+\/delete$/) && req.method === "POST" ? redirectIfNotAuthenticated(contactDeleteHandler) :
                                    pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "GET" ? redirectIfNotAuthenticated(contactEditPageHandler) :
                                        pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "POST" ? redirectIfNotAuthenticated(contactUpdateHandler) :
                                            pathLowerCase.startsWith('/assets/') && req.method === "GET" ? staticFileHandler :
                                                pathLowerCase === '/register' && req.method === 'POST' ? registerHandler :
                                                    pathLowerCase === '/register' && req.method === 'GET' ? registerPageHandler :
                                                        pathLowerCase === '/login' && req.method === 'POST' ? loginHandler :
                                                            pathLowerCase === '/login' && req.method === 'GET' ? loginPageHandler :
                                                                pathLowerCase === '/logout' && req.method === 'GET' ? logoutHandler :
                                                                    defaultHandler;


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


