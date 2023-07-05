import * as http from "http";
import * as fs from "fs";
import {
    makePrivateHandler,
    MyHttpListener,
    parseRequestCookies,
    staticFileListener,
    userIdFromCookie,
    writeMyResToNodeResponse
} from "./utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {
    contactDeleteListener,
    contactEditPageListener,
    contactRequestListener,
    contactUpdateListener,
    contactusRedirectListener
} from "./contact";
import {defaultListener} from "./handler-default";
import {registerRequestListener} from "./register";
import {loginRequestListener} from "./login";
import {homeRequestListener} from "./home";
import {submittedContactFormsRequestListener} from "./dashboard";

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
    const contactHandler = contactRequestListener(con, smtpTransport);
    const contactusRedirectHandler = contactusRedirectListener();
    const staticFileHandler = staticFileListener(mimetypes);
    const homePageHandler = homeRequestListener();
    const submittedContactFormsHandler = submittedContactFormsRequestListener(con);
    const contactDeleteHandler = contactDeleteListener(con);
    const contactUpdateHandler = contactUpdateListener(con);
    const contactEditPageHandler = contactEditPageListener(con);
    const registerHandler = registerRequestListener(con);
    const loginHandler = loginRequestListener(con);


    http.createServer(function (req, res) {
        const allCookiesMap = parseRequestCookies(req.headers.cookie);
        console.log("all cookies:", allCookiesMap);
        userIdFromCookie(con, allCookiesMap.get("loginid")).then(value => console.log('userid=', value))
        const parsedUrl = new URL('http://' + req.headers.host + req.url);
        const pathLowerCase = parsedUrl.pathname.toLowerCase();
        const handlerFound: MyHttpListener =
            pathLowerCase === '/contact' && req.method === 'POST' ? contactHandler :
                pathLowerCase === '/contactus' && req.method === 'GET' ? contactusRedirectHandler :
                    (pathLowerCase === "/" || pathLowerCase === "/home") && req.method === "GET" ? homePageHandler :
                        pathLowerCase === "/form-dashboard" && req.method === "GET" ? makePrivateHandler(con, submittedContactFormsHandler) :
                            pathLowerCase.match(/^\/form-dashboard\/\d+\/delete$/) && req.method === "POST" ? makePrivateHandler(con, contactDeleteHandler) :
                                pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "GET" ? makePrivateHandler(con, contactEditPageHandler) :
                                    pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "POST" ? makePrivateHandler(con, contactUpdateHandler) :
                                        pathLowerCase.startsWith('/assets/') && req.method === "GET" ? staticFileHandler :
                                            pathLowerCase === '/register' && req.method === 'POST' ? registerHandler :
                                                pathLowerCase === '/login' && req.method === 'POST' ? loginHandler :
                                                    defaultHandler;


        handlerFound(req, parsedUrl)
            .then(myres => writeMyResToNodeResponse(myres, res))
            .catch(err => {
                console.error(new Date(), err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('An unexpected error occurred.')
            })
    }).listen(3000);
});


