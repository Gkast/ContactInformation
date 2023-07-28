import {UserDetails} from "../../auth/authentication";

export function headerHtml(user: UserDetails) {
    return !user ? `
<a href="/login">
    <button class="btn">Log In</button>
</a>
<a href="/register">
    <button class="btn">Register</button>
</a>` : `
<span class="user">${user.username}</span>
<div>
    <form method="post" action="/logout">
        <button class="btn">Log out</button>
    </form>
</div>`
}

export function footerHtml() {
    return `<div><span>Just a random footer</span></div>`;
}