import {HttpRouter, MyHttpListener} from "./my-http/my-http";
import {pageNotFoundResponse} from "./my-http/client-error-response";
import {downloadUploadedFilesReqList, uploadFileReqList} from "../tools/file-req-list";
import {uploadListPage} from "../tools/file-list";
import {adminHandler, authHandler} from "./auth/authentication";
import {uploadFilePage} from "../tools/upload-file";
import {staticFileReqList} from "./utility";
import {imgResizeReqList} from "../tools/img-resize-req-list";
import {imgResizePage} from "../tools/img-resize";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "../tools/csv";
import {
    cancelReservationReqList,
    cancelReservationTokenReqList,
    changeSeatReqList, reservationReqList
} from "../cinema/reservation/reservation-req-list";
import {changeSeatPage} from "../cinema/reservation/change-seat";
import {cancelReservationPage} from "../cinema/reservation/cancel-reservation";
import {reservationCheckPage, reservationCheckReqList} from "../cinema/reservation/check-reservation";
import {reservationPage} from "../cinema/reservation/reservation";
import {screeningListPage} from "../cinema/screening/screening-list";
import {addScreeningReqList} from "../cinema/screening/screening-req-list";
import {addScreeningPage} from "../cinema/screening/add-screening";
import {addMovieReqList, deleteMovieReqList, editMovieReqList} from "../movies/movie-req-list";
import {addMoviePage, movieEditPage} from "../movies/movie";
import {movieListPage} from "../movies/movie-list";
import {
    exportCSVContactsReqList,
    exportJSONContactsReqList,
    exportXMLContactsReqList
} from "../contact/export-contacts";
import {contactDeleteReqList, contactEditReqList, contactReqList} from "../contact/contact-req-list";
import {contactEditPage, contactPage} from "../contact/contact";
import {contactListPage, streamableContactListPage} from "../contact/contact-list";
import {
    changePasswordReqList, loginReqList,
    logoutReqList,
    recoveryTokenGeneratorReqList,
    registerReqList
} from "../main/client-auth/client-auth";
import {
    changePasswordPage,
    forgotPasswordPage,
    recoveryTokenVerificationPage
} from "../main/client-auth/reset-password";
import {loginPage} from "../main/client-auth/login";
import {captchaProtectedHandler} from "./auth/captcha";
import {registerPage} from "../main/client-auth/register";
import {hotelDetailsPage} from "../main/hotel-details";
import {aboutPage} from "../main/about";
import {homePage} from "../main/home";
import {Connection} from "mysql";
import {Transporter} from "nodemailer";

export async function initializeRoutes(
    router: HttpRouter<MyHttpListener>,
    con: Connection,
    smtpTransport: Transporter,
    captchaSecret: string
): Promise<void> {

}