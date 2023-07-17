import {MyHttpListener, MyHttpResponse} from "./utility";
import {pageHtml} from "./page";
import * as formidable from "formidable";
import * as fs from "fs";

export function uploadPageRequestListener(): MyHttpListener {
    return (req, user) => {
        const contentHtml = `
<form method="post" id="upload-form" action="http://localhost:3000/upload" enctype="multipart/form-data">
    <input type="file" name="uploadFile" id="upload-file" class="form-inputs" required>
    <button type="submit" id="submit-button">Submit</button>
</form>`
        return Promise.resolve({
            headers: new Map(Object.entries({'Content-Type': 'text/html'})),
            body: pageHtml({user: user, title: "Upload"}, contentHtml)
        });
    }
}

export function uploadRequestListener(): MyHttpListener {
    return (req, user) => {
        return new Promise((resolve, reject) => {
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
<a href="/home">Home</a>`;
                                resolve({
                                    headers: new Map(Object.entries({
                                        'content-type': 'text/html'
                                    })),
                                    body: pageHtml({user: user, title: "File uploaded"}, contentHtml)
                                } as MyHttpResponse)
                            }
                        })
                    } else {
                        reject('Missing "uploadFile" param');
                    }
                }
            })
        })
    }
}