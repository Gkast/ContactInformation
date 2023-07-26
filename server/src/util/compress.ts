import {MyHttpListener} from "./my-http";
import * as archiver from "archiver";

export function downloadUploadFilesReqList(): MyHttpListener {
    return (req, user) => Promise.resolve({
        headers: new Map(Object.entries({
            'content-disposition': 'attachment; filename=uploads.zip'
        })),
        body: res => {
            const archive = archiver('zip');
            archive.directory('../../server/uploads', 'uploads');
            archive.finalize();
            archive.pipe(res);
        }
    })
}