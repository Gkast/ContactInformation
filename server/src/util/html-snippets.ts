import {UserDetails} from "../authentication/authentication";

export function skeletonHtmlPage(pageParams: {
    title: string;
    user?: UserDetails;
    hasCaptcha?: boolean
} & NodeJS.Dict<any>, contentHtml: string): string {
    return pageHtmlTop(pageParams) + contentHtml + pageHtmlBottom(pageParams)
}

export function pageHtmlTop(
    pageParams: {
        title: string;
        user?: UserDetails;
        hasCaptcha?: boolean
    } & NodeJS.Dict<any>): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${pageParams.title}</title>
    <link rel="stylesheet" type="text/css" href="../../assets/css/main.css">
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
        <div class="content-wrapper">`;
}

export function pageHtmlBottom(
    pageParams: {
        title: string;
        user?: UserDetails;
        hasCaptcha?: boolean
    } & NodeJS.Dict<any>): string {
    return `</div>
    </div>
    <footer>
        ${footerHtml()}
    </footer>
    <script src="../../assets/js/main.js"></script>
    ${pageParams.hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
</body>
</html>`;
}

function headerHtml(user: UserDetails) {
    if (!user) {
        return `
        <a href="/login" id="login-button" class="no-underline"><button class="btn">Log In</button></a>
        <a href="/register" id="register-button" class="no-underline"><button class="btn">Register</button></a>`;
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

function footerHtml() {
    return ``;
}