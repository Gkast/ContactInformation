import {MyHttpListener} from "../my-http/http-handler";
import {Pool} from "mysql";
import {Transporter} from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import {authHandler} from "../../auth/authentication";
import {contactEditPage, contactPage} from "../../contact/contact";
import {contactDeleteReqList, contactEditReqList, contactReqList} from "../../contact/contact-req-list";
import {contactListPage, streamableContactListPage} from "../../contact/contact-list";
import {
    exportCSVContactsReqList,
    exportJSONContactsReqList,
    exportXMLContactsReqList
} from "../../contact/export-contacts";
import {HttpRouter} from "../config/router-config";

export async function setupContactRoutes(
    router: HttpRouter<MyHttpListener>,
    dbPool: Pool,
    smtpTransport: Transporter<SMTPTransport.SentMessageInfo>): Promise<void> {
    router.add('GET', '/contact', authHandler(contactPage()));
    router.add('POST', '/contact', authHandler(contactReqList(dbPool, smtpTransport)));
    router.add('GET', "/contact-list", authHandler(contactListPage(dbPool)));
    router.add('GET', "/contact-list-stream", authHandler(streamableContactListPage(dbPool)));
    router.add('POST', '/contact-list/:id/delete', authHandler(contactDeleteReqList(dbPool)));
    router.add('GET', '/contact-list/:id', authHandler(contactEditPage(dbPool)));
    router.add('POST', '/contact-list/:id', authHandler(contactEditReqList(dbPool)));
    router.add('GET', "/contact-list-csv", authHandler(exportCSVContactsReqList(dbPool)));
    router.add('GET', "/contact-list-xml", authHandler(exportXMLContactsReqList(dbPool)));
    router.add('GET', "/contact-list-json", authHandler(exportJSONContactsReqList(dbPool)));
}