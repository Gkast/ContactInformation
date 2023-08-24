import {PageParams} from "../util/my-http/200";
import {React} from "../util/react";
import {UserDetails} from "../util/auth/authentication";

export function skeletonHtmlPage(params: PageParams & NodeJS.Dict<any>, contentHtml: string): string {
    return `<!DOCTYPE html>` +
        <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <title>{params.title}</title>
            <link rel="stylesheet" type="text/css" href="../../assets/css/main.css"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body>
        <header class="hd-cont">
            <div>
                <h1><a href="/home" title="Home" class="no-underline">Server Side Rendering Project</a></h1>
            </div>
            <nav class="nv-cont">
                {headerHtml(params.user)}
            </nav>
        </header>
        <main class="mn-sect">
            <article>
                {contentHtml}
            </article>
        </main>
        <footer class="ft-cont">
            {footerHtml()}
        </footer>
        <script src="../../assets/js/main.js"></script>
        {params.hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
        </body>
        </html>;
}

export function pageHtmlTop(params: PageParams & NodeJS.Dict<any>): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${params.title}</title>
    <link rel="stylesheet" type="text/css" href="../../assets/css/main.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <header class="hd-cont">
        <div>
            <h1><a href="/home" title="Home" class="no-underline">Server Side Rendering Project</a></h1>
        </div>
        <nav class="nv-cont">
            ${headerHtml(params.user)}
        </nav>
    </header>
    <main class="mn-sect">
        <article>`;
}

export function pageHtmlBottom(hasCaptcha = false): string {
    return `
        </article>
    </main>
    <footer class="ft-cont">
        ${footerHtml()}
    </footer>
    <script src="../../assets/js/main.js"></script>
    ${hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
</body>
</html>`;
}

export function headerHtml(user: UserDetails): string {
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

export function footerHtml(): string {
    return <div>
        <span class="cl-gr">Server Side Rendering Project</span>
    </div>;
}