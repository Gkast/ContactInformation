import {PageParams} from "../../util/my-http/responses/200";
import {footerHtml, headerHtml} from "./html-snippets";

export function skeletonHtmlPage(params: PageParams & NodeJS.Dict<any>, contentHtml: string): string {
    return pageHtmlTop(params) + contentHtml + pageHtmlBottom(params.hasCaptcha)
}

export function pageHtmlTop(params: PageParams & NodeJS.Dict<any>): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${params.title}</title>
    <link rel="stylesheet" type="text/css" href="../../../assets/css/main.css">
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
    <script src="../../../assets/js/main.js"></script>
    ${hasCaptcha ? '<script src="https://www.google.com/recaptcha/api.js" async defer></script>' : ''}
</body>
</html>`;
}