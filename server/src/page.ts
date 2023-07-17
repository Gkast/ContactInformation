import {MyHttpResponse} from "./utility";
import {UserDetails} from "./authentication";

export function pageHtml(pageParams: {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
} & NodeJS.Dict<any>, contentHtml: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${pageParams.title}</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/main.css">
</head>
<body>
    <header>
        <div class="header-box">
            <h1><a href="/home" class="no-underline" title="Home">Contact Information</a></h1>
        </div>
        <div class="header-box">
            ${headerHtml(pageParams.user)}
        </div>
    </header>
    <div class="main-wrapper">
        <div class="content-wrapper">
            ${contentHtml}
        </div>
    </div>
    <script src="../assets/js/main.js"></script>
    ${pageParams.hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
</body>
</html>`;
}

export function pageNotFound(): Promise<MyHttpResponse> {
    return Promise.resolve({
        status: 404,
        headers: new Map(Object.entries({'Content-Type': 'text/html',})),
        body: '<h1>Page Not Found</h1>'
    } as MyHttpResponse)
}

export function wrongCredentials(): Promise<MyHttpResponse> {
    return Promise.resolve({
        status: 401,
        headers: new Map(Object.entries({'Content-Type': 'text/html',})),
        body: '<h1>Wrong Credentials</h1>'
    } as MyHttpResponse)
}

function headerHtml(user: UserDetails) {
    if (!user) {
        return `
        <a href="/login" id="login-button"><button class="btn">Log In</button></a>
        <a href="/register" id="register-button"><button class="btn">Register</button></a>`;
    } else {
        return `
        <span id="userId">${user.username.toUpperCase()}</span>
        <div style="display: inline-block">
        <form method="post" action="/logout">
            <button class="btn">Log out</button>
        </form>
</div>`;
    }
}
