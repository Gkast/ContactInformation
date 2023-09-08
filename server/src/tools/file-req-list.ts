import {MyHttpListener} from "../util/my-http/http-handler";
import * as formidable from "formidable";
import * as fs from "fs";
import {downloadResponse, pageHtmlResponse} from "../util/my-http/responses/successful-response";
import * as archiver from "archiver";
import {badRequestResponse} from "../util/my-http/responses/client-error-response";

export function uploadFileReqList(): MyHttpListener {
    return async (req, user) => {
        const files = await new formidable.IncomingForm().parse(req.nodeJsReqObject)
        const file = files['uploadFile'] instanceof Array ?
            (files['uploadFile'] as formidable.File[])[0] :
            (files['uploadFile'] as formidable.File);
        if (file) {
            await fs.promises.rename(file.filepath, '../uploads/' + file.originalFilename)
            return (pageHtmlResponse({
                user: user, title: "File uploaded", contentHtml: `
        <h1>File Uploaded</h1>
        <a href="/home" class="no-underline">
            <button class="btn">Home</button>
        </a>`
            }));
        }
        return badRequestResponse();
    }
}

export function downloadUploadedFilesReqList(): MyHttpListener {
    return async () => downloadResponse('uploads.zip', res => {
        const archive = archiver('zip');
        archive.directory('../../server/uploads', 'uploads');
        archive.finalize();
        archive.pipe(res);
    })
}