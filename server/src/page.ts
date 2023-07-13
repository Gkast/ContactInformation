export function pageHtml(title, user, contentHtml): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/main.css">
</head>
<body>
    <header>
        <div class="header-box">
            <h1><a href="/home" class="no-underline">Contact Information</a></h1>
        </div>
        <div class="header-box">
            ${headerHtml(user)}
        </div>
    </header>
    <div class="main-wrapper">
        ${contentHtml}
    </div>
    <script src="../assets/js/main.js"></script>
</body>
</html>`;
}

function headerHtml(user) {
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