import {Connection} from "mysql";
import {MyHttpListener, parseRequestCookies} from "./utility";


export interface UserDetails {
    id: number;
    username?: string;
    email?: string;
    admin?: boolean;
}

export function userIdFromCookie(con: Connection, loginId: string): Promise<UserDetails> {
    return new Promise((resolve, reject) => {
        if (!loginId) {
            resolve(undefined);
        } else {
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
            });
        }
    })
}

export function withUserId(con: Connection, handler: MyHttpListener): MyHttpListener {
    return (req, url) => {
        const loginCookie = parseRequestCookies(req.headers.cookie).get('loginid')
        return userIdFromCookie(con, loginCookie)
            .then(user => {
                if (user) {
                    con.query(`UPDATE login_cookies
                               SET last_update_datetime=CURRENT_TIMESTAMP
                               WHERE cookie_value = ?`, [loginCookie],
                        (err) => {
                            if (err) {
                                console.error('UPDATE last action error', loginCookie, err)
                            }
                        })
                }
                return handler(req, url, user);
            });
    }
}

export function redirectIfNotAuthenticated(handler: MyHttpListener): MyHttpListener {
    return (req, url, user) => {
        return user ? handler(req, url, user) : Promise.resolve({
            status: 302,
            headers: new Map(Object.entries({'Location': '/login?href=' + encodeURIComponent(url.toString())})),
        });
    }
}
