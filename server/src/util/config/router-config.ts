import {MyHttpListener} from "../my-http/http-handler";
import * as TrekRouter from 'trek-router';
import {Pool} from "mysql";
import {Transporter} from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import {setupMainRoutes} from "../routes/main-routes";
import {setupContactRoutes} from "../routes/contact-routes";
import {setupMovieRoutes} from "../routes/movie-routes";
import {setupCinemaRoutes} from "../routes/cinema-routes";
import {setupToolsRoutes} from "../routes/tools-routes";
import {logger} from "../../main";

export type HttpMethod =
    | "GET"
    | "POST"
    | "HEAD"
    | "PUT"
    | "DELETE"
    | "CONNECT"
    | "OPTIONS"
    | "TRACE"
    | "PATCH";

export type HttpRouter<T> = {
    add(method: HttpMethod, path: string, handler: T): void;

    find(method: string, path: string): [T, unknown];
};

export async function createRouter(
    dbPool: Pool,
    smtpTransport: Transporter<SMTPTransport.SentMessageInfo>,
    captchaSecret: string): Promise<HttpRouter<MyHttpListener>> {
    const router: HttpRouter<MyHttpListener> = new TrekRouter();
    await initializeRoutes(router, dbPool, smtpTransport, captchaSecret);
    logger.info("Router initialized");
    return router;
}

async function initializeRoutes(
    router: HttpRouter<MyHttpListener>,
    dbPool: Pool,
    smtpTransport: Transporter<SMTPTransport.SentMessageInfo>,
    captchaSecret: string): Promise<void> {
    await setupMainRoutes(router, dbPool, smtpTransport, captchaSecret);
    await setupContactRoutes(router, dbPool, smtpTransport);
    await setupMovieRoutes(router, dbPool);
    await setupCinemaRoutes(router, dbPool, smtpTransport);
    await setupToolsRoutes(router, dbPool);
}

