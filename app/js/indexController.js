var setUserButton = document.getElementById('setUserButton'),
    usernameInput = document.getElementById('usernameInput'),
    ls = window.localStorage,
    ss = window.sessionStorage;

function checkUser(){
    if (ls.getItem('username') != null){
        window.location.assign("/home");
    }
}
checkUser();

function setUser(){
    if (usernameInput.value != ''){
        ls.setItem('username', usernameInput.value);
        window.location.assign("/home");
    } else {
        Materialize.toast('Sorry... what was your name again?', 3000)
    }
}
setUserButton.onclick = setUser;
