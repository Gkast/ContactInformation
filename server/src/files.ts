import {MyHttpListener} from "./utility";
import * as fs from "fs";
import {pageHtml} from "./page";

export function uploadedFileListPageRequestListener(): MyHttpListener {
    return (req, user) => {
        return new Promise((resolve, reject) => {
            let fileQueryHtml = '';
            fs.readdir('../assets/files/', (err, files) => {
                files.forEach((file, i) => {
                    fileQueryHtml += `
<tr>
    <td class="cell">${i + 1}</td>
    <td class="cell">${file}</td>
    <td class="cell"><a href="../assets/files/${file}">Preview</a></td>
    <td class="cell"><a href="../assets/files/${file}?download=1">Download</a></td>
</tr>`
                })
                if (err) {
                    reject(err)
                    return;
                } else {
                    const contentHtml = `<table class="dashboard">
    <thead>
    <tr>
        <th class="cell">#</th>
        <th class="cell">File Name</th>
        <th class="cell" colspan="2">Actions</th>
    </tr>
    </thead>
    <tbody>
        ${fileQueryHtml}
    </tbody>
</table>
<a href="/file-list" class="action-button">Refresh</a>`
                    resolve({
                        headers: new Map(Object.entries({'content-type': 'text/html'})),
                        body: pageHtml({user: user, title: "Files"}, contentHtml)
                    })
                }
            })
        })
    }
}