import {MyHttpListener} from "../util/my-http/my-http";
import {pageHtmlResponse} from "../util/my-http/200";
import {React} from "../util/react";

export function uploadFilePage(): MyHttpListener {
    return (req, user) => Promise.resolve(pageHtmlResponse({user: user, title: "Upload File"},
        <div class="center-container">
            <form method="post" action="http://localhost:3000/upload-file" enctype="multipart/form-data"
                  class="form-container">
                <input type="file" name="uploadFile" required/>
                <button type="submit" class="btn">Upload</button>
            </form>
        </div>
    ))
}