import {UserDetails} from "../../auth/authentication";
import {React} from "../../util/react";

export function headerHtml(user: UserDetails) {
    return !user ?
        <div class="flx-rw">
            <a href="/login" class="no-underline mr-rgt">
                <button class="btn">Log In</button>
            </a>
            <a href="/register" class="no-underline">
                <button class="btn">Register</button>
            </a>
        </div> :
        <div class="flx-rw">
            <span class="user mr-rgt">{user.username}</span>
            <form method="post" action="/logout">
                <button class="btn">Log out</button>
            </form>
        </div>
}

export function footerHtml() {
    return <div>
        <span class="cl-gr">Server Side Rendering Project</span>
    </div>;
}