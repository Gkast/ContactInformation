import {UserDetails} from "../../auth/authentication";

export function headerHtml(user: UserDetails) {
    return !user ? `
<a href="/login">
    <button>Log In</button>
</a>
<a href="/register">
    <button>Register</button>
</a>` : `
<span>${user.username}</span>
<div>
    <form method="post" action="/logout">
        <button>Log out</button>
    </form>
</div>`
}

export function footerHtml() {
    return ``;
}