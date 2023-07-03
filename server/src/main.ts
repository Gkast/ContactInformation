import * as http from "http";
import * as fs from "fs";
import {writeMyResToNodeResponse} from "./utility";
import * as nodemailer from 'nodemailer';
import * as mysql from 'mysql';
import {
    contactusRedirectListener,
    contactRequestListener,
    submittedContactFormsRequestListener,
    contactUpdateListener, contactEditPageListener, contactDeleteListener
} from "./contact";
import {defaultListener, homeRequestListener, staticFileListener} from "./handler-default";

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


    http.createServer(function (req, res) {
        const parsedUrl = new URL('http://' + req.headers.host + req.url);
        const pathLowerCase = parsedUrl.pathname.toLowerCase();
        const handlerFound =
            pathLowerCase === '/contact' && req.method === 'POST' ? contactHandler :
                pathLowerCase === '/contactus' && req.method === 'GET' ? contactusRedirectHandler :
                    (pathLowerCase === "/" || pathLowerCase === "/home") && req.method === "GET" ? homePageHandler :
                        pathLowerCase === "/form-dashboard" && req.method === "GET" ? submittedContactFormsHandler :
                            pathLowerCase.match(/^\/form-dashboard\/\d+\/delete$/) && req.method === "POST" ? contactDeleteHandler :
                                pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "GET" ? contactEditPageHandler :
                                    pathLowerCase.match(/^\/form-dashboard\/\d+$/) && req.method === "POST" ? contactUpdateHandler :
                                        pathLowerCase.startsWith('/assets/') && req.method === "GET" ? staticFileHandler :
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


