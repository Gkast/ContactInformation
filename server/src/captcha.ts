import * as https from "https";
import {MyHttpListener, singleParam, streamToString} from "./utility";
import * as querystring from "querystring";
import {Readable} from "stream";

export function captchaVerification(responseKey: string, secretKey: string): Promise<boolean> {
    return new Promise((resolve, reject) =>
        https.request({
            host: 'www.google.com',
            path: '/recaptcha/api/siteverify',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        }, res => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                streamToString(res).then(body => {
                    resolve(JSON.parse(body)?.success);
                })
            } else {
                resolve(false);
            }
        }).end(`secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(responseKey)}`)
            .on('error', reject))
}

export function captchaProtectedHandler(secret: string, handler: MyHttpListener): MyHttpListener {
    return (req, user) =>
        streamToString(req.body).then(bodyString => {
            const responseKey = req.method === 'GET' ?
                req.url.searchParams.get('g-recaptcha-response') :
                singleParam(querystring.parse(bodyString)['g-recaptcha-response']);
            return captchaVerification(responseKey, secret).then(captchaResult =>
                captchaResult ? handler(Object.assign({}, req, {body: stringAsStream(bodyString)}), user) : {
                    status: 302,
                    headers: new Map(Object.entries({
                        'Content-Type': 'type/html'
                    })),
                    body: `<h1>Captcha wasn't verified</h1>`
                })
        })
}


export function stringAsStream(s: string): NodeJS.ReadableStream {
    return Readable.from(s);
}