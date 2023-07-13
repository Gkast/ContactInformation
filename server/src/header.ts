import {UserDetails} from "./auth";

export function headerHtml(user: UserDetails) {
    if (!user){
        return `<header>
        <div class="heading-box">
            <h1>Contact Information</h1>
        </div>
        <div class="button-box">
            <a href="/login" id="login">Log In</a>
            <a href="/register" id="register">Register</a>
        </div>
    </header>`;
    }else {
        return `<header>
      <div class="heading-box">
        <h1>Contact Information</h1>
      </div>
      <div class="user-box">
        <span id="userId">Hello ${user.username}!</span>
        <a href="/logout">Log Out</a>
      </div>
    </header>`;
    }
}