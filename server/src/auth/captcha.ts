import * as https from "https";
import {firstParam, streamToString, stringAsStream} from "../util/util";
import * as querystring from "querystring";
import {MyHttpListener} from "../util/my-http/http-handler";
import {badRequestResponse} from "../util/my-http/responses/client-error-response";

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
    return async (req, user) => {
        const bodyString = await streamToString(req.body);
        const responseKey = req.method === 'GET' ?
            req.url.searchParams.get('g-recaptcha-response') :
            firstParam(querystring.parse(bodyString)['g-recaptcha-response']);
        const captchaResult = await captchaVerification(responseKey, secret);
        return (captchaResult ? handler(Object.assign({}, req, {body: stringAsStream(bodyString)}), user) :
            badRequestResponse('Captcha Not Verified', `<h1>Captcha wasn't verified</h1>`));
    }
}