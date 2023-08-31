import {Pool} from "mysql";
import {parseRequestCookies} from "../util/util";
import {MyHttpListener} from "../util/my-http/http-handler";
import {redirectResponse} from "../util/my-http/responses/redirect-response";
import {logger} from "../main";

export type UserDetails = {
    id: number;
    username?: string;
    email?: string;
    admin?: boolean;
}

export function userIdFromCookie(con: Pool, loginId: string): Promise<UserDetails> {
    return new Promise((resolve, reject) => !loginId ? resolve(undefined) :
        con.query(`SELECT login_cookies.user_id AS id, users.username, users.email, users.is_admin AS admin
                   FROM login_cookies
                            JOIN users on login_cookies.user_id = users.id
                   WHERE cookie_value = ?
                     AND has_logged_out = 0
                     AND DATE_ADD(last_update_datetime, INTERVAL expires_interval_minutes MINUTE) >
                         CURRENT_TIMESTAMP`, [loginId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                const user = results[0];
                if (user) {
                    user.admin = user.admin === 1;
                }
                resolve(user as UserDetails);
            }
        }))
}

export function withUserId(con: Pool, handler: MyHttpListener): MyHttpListener {
    return (req) => {
        const loginCookie = parseRequestCookies(req.headers.cookie).get('loginid')
        return userIdFromCookie(con, loginCookie)
            .then(user => {
                if (user) {
                    con.query(`UPDATE login_cookies
                               SET last_update_datetime=CURRENT_TIMESTAMP
                               WHERE cookie_value = ?`, [loginCookie], err => {
                        if (err) {
                            logger.error(`UPDATE last action error ${err}`, {
                                loginCookie: loginCookie,
                                message: err.message,
                                stack: err.stack
                            })
                        }
                    })
                }
                return handler(req, user);
            });
    }
}

export function authHandler(handler: MyHttpListener): MyHttpListener {
    return (req, user) => user ? handler(req, user) :
        Promise.resolve(redirectResponse('/login?href=' + encodeURIComponent(req.url.toString())))
}

export function adminHandler(handler: MyHttpListener): MyHttpListener {
    return (req, user) => user.admin ? handler(req, user) : Promise.resolve(redirectResponse('/home'))
}

