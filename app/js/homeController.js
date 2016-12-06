var gossipSpawner = document.getElementById('gossipSpawner'),
    EnterAsUserButtonM = document.getElementById('EnterAsUserButtonM'),
    gossipText = document.getElementById('gossipText'),
    publishGossipBtn = document.getElementById('PublishGossipBtn'),
    ls = window.localStorage,
    ss = window.sessionStorage,
    serverUrl = 'http://gossip-app.herokuapp.com',
    GossipArray = [],
    banner, progress, indeterminate, lel,
    black = false;

$(document).ready(function() {
    $('.modal-trigger').leanModal();
});

function getUser() {
    return ls.getItem('username');
}

function startProgress() {
    banner = document.getElementById("banner"),
        progress = document.createElement("div"),
        indeterminate = document.createElement("div");
    progress.className = "progress";
    indeterminate.className = "indeterminate blue";
    progress.appendChild(indeterminate);
    banner.appendChild(progress);
}

function stopProgress() {
    progress.style.display = "none";
}
//--------------------------------------------XHR functions --------------------------------------------------------------------
function getAllGossips() {
    startProgress();
    let XHR = new XMLHttpRequest();
    let url = serverUrl + '/gossip/all';
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        let getAllResponse = JSON.parse(res.target.response);
        GossipArray = (getAllResponse.gossips)
        render(GossipArray);
    }
}

function eraseGossipSelf(id, user) {
    let XHR = new XMLHttpRequest();
    let url = serverUrl + '/gossip/delete?id_gossip=' + id + '&id_usuario=' + user;
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        deleteResponse = JSON.parse(res.target.response);
        if (deleteResponse.status == 200) {
            let cardId = ["Card", id, user].join("_"),
                gossipCardo = document.getElementById(cardId);
            gossipCardo.style.display = "none";
            Materialize.toast(deleteResponse.message, 2000);
        } else {
            Materialize.toast('A ' + deleteResponse.status + ' error ocurred: ' + deleteResponse.message, 2000);
        }
    }
}

function createGossip() {
    if (gossipText.value == '') {
        Materialize.toast("If you don't wanna tell me anything, you don't have to...", 2000);
    } else if (gossipText.value.length > 140) {
        Materialize.toast('*snoozes*..."Ummm.. well, yeah. I have something else to do."', 2000)
    } else {
        let XHR = new XMLHttpRequest(),
            url = serverUrl + '/gossip/create',
            user = getUser();
        params = {
            id_usuario: user,
            de_gossip: gossipText.value
        };
        XHR.open('post', url, 'true');
        XHR.setRequestHeader('Content-Type', 'application/json');
        XHR.send(JSON.stringify(params));
        XHR.onload = function(res) {
            let createResponse = JSON.parse(res.target.response);
            console.log(createResponse);
            newGossip = createResponse.gossip;
            console.log(newGossip);
            renderOne(newGossip);
            Materialize.toast(createResponse.message, 2000);
        }
    }
}
publishGossipBtn.onclick = createGossip;


//------------------------------------------------------------Buttons functions--------------------------------------------------

function getGossipUser(id) {
    for (var i = 0; i < GossipArray.length; i++) {
        if (GossipArray[i].id_gossip == id) {
            return GossipArray[i].id_usuario;
        }
    }
}

function enterAsAnotherUser() {
    ls.removeItem('username');
    window.location.assign("/");
}
EnterAsAnotherUserButtonM.onclick = enterAsAnotherUser;

function renderOne(gossip) {
    var cardColor,
        karmaColor,
        textColor,
        karmaSign;

    if (black == false) {
        cardColor = 'lighten-2';
        textColor = 'black-text';
        black = true;
    } else {
        cardColor = 'darken-2';
        textColor = 'white-text';
        black = false;
    }

    if (gossip.ka_gossip > 0) {
        karmaColor = "cyan";
        karmaSign = "+";

    } else if (gossip.ka_gossip < 0) {
        karmaColor = "red";
        karmaSign = "-";

    } else if (gossip.ka_gossip == 0) {
        karmaColor = "grey darken-4";
        karmaSign = "";
    }

    let gossipCard = document.createElement("div");
    gossipCard.className = "card grey " + cardColor + " hoverable";
    gossipCard.id = ["Card", gossip.id_gossip, gossip.id_usuario].join("_");

    let cardContent = document.createElement("div");
    cardContent.className = "card-content " + textColor;

    let divRow = document.createElement("div");
    divRow.className = "row";

    let cardTitle = document.createElement("span");
    cardTitle.className = "card-title col"
    cardTitle.innerHTML = gossip.id_usuario + ":";

    let closeButton = document.createElement("a");
    closeButton.className = "waves-effect btn-flat " + textColor + " right EraseBtn";
    closeButton.innerHTML = '<i class="material-icons">close</i>';
    closeButton.id = ["Erase", gossip.id_gossip, gossip.id_usuario].join("_");
    closeButton.name = "EraseBtn"
    closeButton.onclick = checkIfUserGossip;

    let gossipContent = document.createElement("p");
    gossipContent.innerHTML = gossip.de_gossip;

    let cardAction = document.createElement("div");
    cardAction.className = "card-action";

    let posKarma = document.createElement("a");
    posKarma.className = "waves-effect white-text cyan btn-large"
    posKarma.innerHTML = '<i class="material-icons">exposure_plus_1</i>'
    posKarma.id = "posKarma_" + gossip.id_gossip;

    let negKarma = document.createElement("a");
    negKarma.className = "waves-effect white-text red btn-large"
    negKarma.innerHTML = '<i class="material-icons">exposure_minus_1</i>'
    negKarma.id = "negKarma_" + gossip.id_gossip;

    let chip = document.createElement("div");
    chip.className = "chip " + karmaColor + " white-text";
    chip.innerHTML = karmaSign + gossip.ka_gossip;


    cardAction.appendChild(posKarma);
    cardAction.appendChild(negKarma);
    cardAction.appendChild(chip);
    divRow.appendChild(cardTitle);
    divRow.appendChild(closeButton);
    cardContent.appendChild(divRow);
    cardContent.appendChild(gossipContent);
    gossipCard.appendChild(cardContent);
    gossipSpawner.appendChild(gossipCard);
    gossipCard.appendChild(cardAction)

}

function render(gossip) {
    for (var i = 0; i < gossip.length; i++) {
        renderOne(gossip[i]);
        if (i < gossip.length) {
            stopProgress();
        }
    }
}

function checkIfUserGossip() {
    let idArr = this.id.split("_");
    if (ls.getItem('username') == idArr[2]) {
        eraseGossipSelf(idArr[1], idArr[2]);
    } else {
        Materialize.toast("Nice try. That's not your gossip, pal.", 2000);
    }
}


getAllGossips();
