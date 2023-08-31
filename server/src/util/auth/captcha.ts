import * as https from "https";
import {firstParam, streamToString, stringAsStream} from "../utility";
import * as querystring from "querystring";
import {MyHttpListener} from "../my-http/my-http";
import {badRequestResponse} from "../my-http/client-error-response";

export function captchaVerification(responseKey: string, secretKey: string): Promise<boolean> {
    return new Promise((resolve, reject) => https.request({
        host: 'www.google.com',
        path: '/recaptcha/api/siteverify',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
    }, res => res.statusCode >= 200 && res.statusCode < 300 ?
        streamToString(res).then(body => resolve(JSON.parse(body)?.success)) : resolve(false))
        .end(`secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(responseKey)}`)
        .on('error', reject))
}

export function captchaProtectedHandler(secret: string, handler: MyHttpListener): MyHttpListener {
    return (req, user) => streamToString(req.body).then(bodyString => {
        const responseKey = req.method === 'GET' ?
            req.url.searchParams.get('g-recaptcha-response') :
            firstParam(querystring.parse(bodyString)['g-recaptcha-response']);
        return captchaVerification(responseKey, secret).then(captchaResult =>
            captchaResult ? handler(Object.assign({}, req, {body: stringAsStream(bodyString)}), user) :
                badRequestResponse('Captcha Not Verified', `<h1>Captcha wasn't verified</h1>`))
    })
}