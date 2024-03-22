// "use strict";
//NodeElement
const $html = document.documentElement;
//Boolean
const IsDark = window.matchMedia("(prefers-color-scheme:dark)").matches;

if (sessionStorage.getItem("theme")) {
    $html.dataset.theme = sessionStorage.getItem("theme");
} else {
    $html.dataset.theme = IsDark ? "dark" : "light"; 
}
let IsPressed = false;

const changeTheme = function() {
    IsPressed = IsPressed ? false : true;
    this.setAttribute("aria-pressed",IsPressed)
    $html.setAttribute("data-theme", ($html.dataset.theme == "light") ? "dark" : "light"); 
    sessionStorage.setItem("theme", $html.dataset.theme);
}

window.addEventListener("load", function () {
    const $themeBtn = document.querySelector("[data-theme-btn]");
    $themeBtn.addEventListener("click",changeTheme)
})