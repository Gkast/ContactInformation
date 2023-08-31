import {MyHttpListener} from "../my-http/http-handler";
import {Pool} from "mysql";
import {testCSVReqList, TestCSVStreamPipeReqList, TestCSVStreamReqList} from "../../tools/csv";
import {imgResizePage} from "../../tools/img-resize";
import {imgResizeReqList} from "../../tools/img-resize-req-list";
import {authHandler} from "../../auth/authentication";
import {staticFileReqList} from "../util";
import {uploadFilePage} from "../../tools/upload-file";
import {downloadUploadedFilesReqList, uploadFileReqList} from "../../tools/file-req-list";
import {uploadListPage} from "../../tools/file-list";
import {HttpRouter} from "../config/router-config";

export async function setupToolsRoutes(router: HttpRouter<MyHttpListener>, dbPool: Pool): Promise<void> {
    router.add('GET', "/csv", testCSVReqList(dbPool));
    router.add('GET', "/csv-stream", TestCSVStreamReqList(dbPool));
    router.add('GET', "/csv-stream-pipe", TestCSVStreamPipeReqList(dbPool));
    router.add('GET', '/img-resize-page', imgResizePage());
    router.add('GET', '/img-resize', imgResizeReqList());
    router.add('GET', '/uploads/*', authHandler(staticFileReqList()));
    router.add('GET', '/upload-file', authHandler(uploadFilePage()));
    router.add('POST', '/upload-file', authHandler(uploadFileReqList()));
    router.add('GET', '/file-list', authHandler(uploadListPage()));
    router.add('GET', '/download-upload-files', downloadUploadedFilesReqList());
}