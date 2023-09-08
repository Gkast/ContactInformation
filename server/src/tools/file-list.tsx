import {MyHttpListener} from "../util/my-http/http-handler";
import * as fs from "fs";
import {pageHtmlResponse} from "../util/my-http/responses/successful-response";
import {React} from "../util/react";

export function uploadListPage(): MyHttpListener {
    return async (req, user) => {
        let fileQueryHtml = '';
        const files = await fs.promises.readdir('../uploads/')
        files.forEach((file) => {
            fileQueryHtml +=
                <div class="list-container flx-rw">
                    <span class="mr-lft" data-file-name="">{file}</span>
                    <div class="file-list-buttons mr-rgt">
                        <a href={"/uploads/" + file} class="no-underline mr-rgt">
                            <button class="btn">Preview</button>
                        </a>
                        <a href={"/uploads/" + file + "?download=1"} class="no-underline">
                            <button class="btn">Download</button>
                        </a>
                    </div>
                </div>
        });
        return pageHtmlResponse({
            user: user, title: "Files", contentHtml: <div class="center-container">
                <input type="text" placeholder="Search files" class="search-list" data-file-search=""/>
                {fileQueryHtml}
                <div class="list-button-container">
                    <a href="/server/src/tools/file-list" class="no-underline">
                        <button class="btn">Refresh</button>
                    </a>
                    <a href="/download-upload-files" class="no-underline">
                        <button class="btn">Download All</button>
                    </a>
                </div>
            </div>
        })
    }
}