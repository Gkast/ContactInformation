import {MyHttpListener} from "../my-http/http-handler";
import {Pool} from "mysql";
import {Transporter} from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import {screeningListPage} from "../../cinema/screening/screening-list";
import {reservationPage} from "../../cinema/reservation/reservation";
import {
    cancelReservationReqList,
    cancelReservationTokenReqList,
    changeSeatReqList,
    reservationReqList
} from "../../cinema/reservation/reservation-req-list";
import {reservationCheckPage, reservationCheckReqList} from "../../cinema/reservation/reservation-check";
import {cancelReservationPage} from "../../cinema/reservation/reservation-cancel";
import {changeSeatPage} from "../../cinema/reservation/change-seat";
import {HttpRouter} from "../config/router-config";

export async function setupCinemaRoutes(router: HttpRouter<MyHttpListener>, dbPool: Pool, smtpTransport: Transporter<SMTPTransport.SentMessageInfo>): Promise<void> {
    router.add('GET', '/screening-list', screeningListPage(dbPool));
    router.add('GET', '/reservation', reservationPage(dbPool));
    router.add('POST', '/reservation', reservationReqList(dbPool, smtpTransport));
    router.add('GET', '/reservation-check', reservationCheckPage());
    router.add('POST', '/reservation-check', reservationCheckReqList(dbPool));
    router.add('POST', '/cancel-reservation-token', cancelReservationTokenReqList(dbPool, smtpTransport));
    router.add('GET', '/cancel-reservation', cancelReservationPage());
    router.add('POST', '/cancel-reservation', cancelReservationReqList(dbPool));
    router.add('POST', '/change-seat-reservation-page', changeSeatPage(dbPool));
    router.add('POST', '/change-seat-reservation', changeSeatReqList(dbPool));
}