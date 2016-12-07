var setUserButton = document.getElementById('setUserButton'),
    usernameInput = document.getElementById('usernameInput'),
    ls = window.localStorage,
    ss = window.sessionStorage;

function checkUser(){
    if (ls.getItem('adminCredentials') != null){
        window.location.assign("/home");
    }
}
checkUser();

function setUser(){
    if (usernameInput.value != ''){
        var adminArray = [usernameInput.value, 1];
        ls.setItem('adminCredentials', adminArray);
        window.location.assign("/home");
    } else {
        Materialize.toast('Sorry... what was your name again?', 3000)
    }
}
setUserButton.onclick = setUser;
