import {MyHttpResponse} from "./utility";
import {UserDetails} from "./authentication";

export function pageHtml(p: {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
} & NodeJS.Dict<any>, contentHtml: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${p.title}</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/main.css">
</head>
<body>
    <header>
        <div class="header-box">
            <h1><a href="/home" class="no-underline">Contact Information</a></h1>
        </div>
        <div class="header-box">
            ${headerHtml(p.user)}
        </div>
    </header>
    <div class="main-wrapper">
        ${contentHtml}
    </div>
    <script src="../assets/js/main.js"></script>
    ${p.hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
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
        <a href="/login" id="login-button">Log In</a>
        <a href="/register" id="register-button">Register</a>`;
    } else {
        return `
        <span id="userId">${user.username.toUpperCase()}</span>
        <a href="/logout">Log Out</a>`;
    }
}
