import * as formidable from "formidable";
import * as fs from "fs";
import {MyHttpListener} from "../util/my-http";
import {pageHtmlResponse} from "../util/my-http-responses";

export function uploadFilePage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form method="post" id="upload-form" action="http://localhost:3000/upload-file" enctype="multipart/form-data">
    <input type="file" name="uploadFile" id="upload-file" class="form-inputs" required>
    <button type="submit" id="submit-button" class="btn">Upload</button>
</form>`
        return Promise.resolve(pageHtmlResponse({user: user, title: "Upload File"}, contentHtml));
    }
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
                    if (file) {
                        fs.rename(file.filepath, '../uploads/' + file.originalFilename, (err) => {
                            if (err) {
                                reject(err)
                            } else {
                                const contentHtml = `
<h1>File Uploaded</h1>
<a href="/home" class="no-underline"><button class="btn">Home</button></a>`;
                                resolve(pageHtmlResponse({user: user, title: "File uploaded"}, contentHtml))
                            }
                        })
                    } else {
                        reject('Missing "uploadFile" param');
                    }
                }
            }))
}