import {UserDetails} from "./auth";

export function headerHtml(user: UserDetails) {
    if (!user){
        return `<header>
        <div class="header-box">
            <h1><a href="/home" class="no-underline">Contact Information</a></h1>
        </div>
        <div class="header-box">
            <a href="/login" id="login-button">Log In</a>
            <a href="/register" id="register-button">Register</a>
        </div>
    </header>`;
    }else {
        return `<header>
      <div class="header-box">
        <h1><a href="/home" class="no-underline">Contact Information</a></h1>
      </div>
      <div class="header-box">
        <span id="userId">${user.username.toUpperCase()}</span>
        <a href="/logout">Log Out</a>
      </div>
    </header>`;
    }
}