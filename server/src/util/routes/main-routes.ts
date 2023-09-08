import {MyHttpListener} from "../my-http/http-handler";
import {Pool} from "mysql";
import {Transporter} from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import {homePage} from "../../main/home";
import {aboutPage} from "../../main/about";
import {hotelDetailsPage} from "../../main/hotel-details";
import {captchaProtectedHandler} from "../../auth/captcha";
import {
    changePasswordReqList,
    loginReqList,
    logoutReqList,
    recoveryTokenGeneratorReqList,
    registerReqList
} from "../../main/client-auth/client-auth";
import {registerPage} from "../../main/client-auth/register";
import {loginPage} from "../../main/client-auth/login";
import {
    changePasswordPage,
    forgotPasswordPage,
    recoveryTokenVerificationPage
} from "../../main/client-auth/reset-password";
import {staticFileReqList} from "../util";
import {pageNotFoundResponse} from "../my-http/responses/client-error-response";
import {HttpRouter} from "../config/router-config";

export async function setupMainRoutes(
    router: HttpRouter<MyHttpListener>,
    dbPool: Pool,
    smtpTransport: Transporter<SMTPTransport.SentMessageInfo>,
    captchaSecret: string): Promise<void> {
    router.add('GET', '/', homePage());
    router.add('GET', '/home', homePage());
    router.add('GET', '/about', aboutPage());
    router.add('GET', '/hotel-details-page', hotelDetailsPage());
    router.add('POST', '/register', captchaProtectedHandler(captchaSecret, registerReqList(dbPool)));
    router.add('GET', '/register', registerPage());
    router.add('POST', '/login', captchaProtectedHandler(captchaSecret, loginReqList(dbPool)));
    router.add('GET', '/login', loginPage());
    router.add('POST', '/logout', logoutReqList(dbPool));
    router.add('GET', '/forgot-password', forgotPasswordPage());
    router.add('POST', '/token-generator', recoveryTokenGeneratorReqList(dbPool, smtpTransport));
    router.add('GET', '/token-verify', recoveryTokenVerificationPage());
    router.add('GET', '/change-password', changePasswordPage());
    router.add('POST', '/change-password', changePasswordReqList(dbPool));
    router.add('GET', '/assets/*', staticFileReqList());
    router.add('GET', '*', async () => pageNotFoundResponse());
}