import {MyHttpListener} from "../my-http/my-http";
import * as archiver from "archiver";

import {downloadResponse} from "../my-http/responses/200";

export function downloadUploadFilesReqList(): MyHttpListener {
    return () => Promise.resolve(downloadResponse('uploads.zip', res => {
        const archive = archiver('zip');
        archive.directory('../../server/uploads', 'uploads');
        archive.finalize();
        archive.pipe(res);
    }));
}