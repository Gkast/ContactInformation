import {MyHttpListener} from "../util/my-http";
import {pageHtmlResponse} from "../util/my-http-responses";
import * as formidable from "formidable";
import * as fs from "fs";

export function uploadImagePage(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form method="post" action="/upload-image" enctype="multipart/form-data">
    <input type="text" name="uploadDescription" placeholder="Description" class="form-inputs" required>
    <input type="file" name="uploadImage" class="form-inputs" accept="image/*" required>
    <button type="submit" class="btn">Upload</button>
</form>`
        return Promise.resolve(pageHtmlResponse({user: user, title: "Upload Image"}, contentHtml));
    }
}

export function uploadImageReqList(): MyHttpListener {
    return (req, user) => new Promise((resolve, reject) =>
        new formidable.IncomingForm().parse(req.nodeJsReqObject, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                const file = files['uploadImage'] instanceof Array ?
                    (files['uploadImage'] as formidable.File[])[0] :
                    (files['uploadImage'] as formidable.File);
                const description = fields['uploadDescription'];
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