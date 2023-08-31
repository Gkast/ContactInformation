import {MyHttpListener} from "../util/my-http/http-handler";
import * as formidable from "formidable";
import * as fs from "fs";
import {downloadResponse, pageHtmlResponse} from "../util/my-http/responses/successful-response";
import * as archiver from "archiver";

export function uploadFileReqList(): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) =>
        new formidable.IncomingForm().parse(req.nodeJsReqObject, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                const file = files['uploadFile'] instanceof Array ?
                    (files['uploadFile'] as formidable.File[])[0] :
                    (files['uploadFile'] as formidable.File);
                file ? fs.rename(file.filepath, '../uploads/' + file.originalFilename, err =>
                    err ? reject(err) : resolve(pageHtmlResponse({
                        user: user, title: "File uploaded", contentHtml: `
<h1>File Uploaded</h1>
<a href="/home" class="no-underline">
    <button class="btn">Home</button>
</a>`
                    }))
                ) : reject('Missing "uploadFile" param');
            }
        }));
}

export function downloadUploadedFilesReqList(): MyHttpListener {
    return () => Promise.resolve(downloadResponse('uploads.zip', res => {
        const archive = archiver('zip');
        archive.directory('../../server/uploads', 'uploads');
        archive.finalize();
        archive.pipe(res);
    }));
}