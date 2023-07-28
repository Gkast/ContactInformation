import * as formidable from "formidable";
import * as fs from "fs";
import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/responses/200";

export function uploadFilePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Upload File"}, `
<div class="center-container">
<form method="post" action="http://localhost:3000/upload-file" enctype="multipart/form-data" class="form-container">
        <input type="file" name="uploadFile" required>
    <button type="submit" class="btn">Upload</button>
</form>
</div>`
    ));
}

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
                    err ? reject(err) : resolve(pageHtmlResponse({user: user, title: "File uploaded"}, `
<h1>File Uploaded</h1>
<a href="/home" class="no-underline">
    <button class="btn">Home</button>
</a>`))
                ) : reject('Missing "uploadFile" param');
            }
        }));
}