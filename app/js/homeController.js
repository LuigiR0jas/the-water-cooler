//Homepage JS Controller
//----------------------------------------------------------------------Global Variables------------------------------------------------------------------------

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

// -------------------------------------------------------------------Initial Functions--------------------------------------------------------------

//Materialize JQuery Modal initialization
$(document).ready(function() {
    $('.modal-trigger').leanModal();
});

function getUser() {
    return ls.getItem('username');
}

function userChip() {
    var chip = document.getElementById("userChip"),
        user = getUser();
    chip.innerHTML = user;
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

//------------------------------------------------------------------------XHR functions --------------------------------------------------------------------

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
        console.log(GossipArray);
    }
}

function getAllAsAdmin(){
    startProgress();
    let XHR = new XMLHttpRequest();
    let url = serverUrl + '/gossip/all';
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        let getAllResponse = JSON.parse(res.target.response);
        GossipArray = (getAllResponse.gossips)
        render(GossipArray);
        console.log(GossipArray);
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
                gossipCardo = document.getElementById(cardId),
                index = getIndexOfGossip(id);
            GossipArray.splice(index, 1);
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
            newGossip = createResponse.gossip;
            renderOne(newGossip);
            GossipArray.push(newGossip)
            Materialize.toast(createResponse.message, 2000);
        }
    }
}
publishGossipBtn.onclick = createGossip;

//----------------------------------------------------------------------Various functions-------------------------------------------------------------------------


function searching() {
    let userSearchResult = [],
        contentSearchResult = [],
        karmaSearchResult = [];

    if (document.searchForm.SearchUserCheckbox.checked) {
        if (document.searchForm.SearchUserInput.value != '') {
            let user = document.searchForm.SearchUserInput.value;
            userSearchResult = searchGossipByUsername(user);
            console.log("searching for: ", user, " and found:", userSearchResult);
        } else {

        }
    };
    if (document.searchForm.SearchContentCheckbox.checked) {
        if (document.searchForm.SearchContentInput.value != '') {
            let content = document.searchForm.SearchContentInput.value;
            contentSearchResult = searchGossipByContent(content);
            console.log("searching for: ", content, " and found:", contentSearchResult);
        } else {

        }
    };
    if (document.searchForm.SearchKarmaCheckbox.checked) {
        for (var i = 0; i < document.searchForm.group1.length; i++) {
            if (document.searchForm.group1[i].checked) {
                let karma = document.searchForm.group1[i].id;
                karmaSearchResult = searchGossipByKarma(karma);
                console.log("searching for: ", karma, " and found:", karmaSearchResult);
            } else {

            }
        }
    };

    let preliminarArray = [userSearchResult, contentSearchResult, karmaSearchResult],
        resultArray = [],
        isEqual = 0,
        calls = 0;
    console.log(preliminarArray);

    for (var i = 0; i < preliminarArray.length; i++) {
        if (preliminarArray[i].length != 0) {
            calls++;
            // console.log(calls);
        }
    }
    if (calls == 1) {
        if (preliminarArray[0].length != 0) {
            for (var k = 0; k < preliminarArray[0].length; k++) {
                // console.log(preliminarArray[0][k]);
                resultArray[k] = preliminarArray[0][k];
            }
        } else if (preliminarArray[1].length != 0) {
            for (var k = 0; k < preliminarArray[1].length; k++) {
                // console.log(preliminarArray[0][k]);
                resultArray[k] = preliminarArray[1][k];
            }
        } else if (preliminarArray[2].length != 0) {
            for (var k = 0; k < preliminarArray[2].length; k++) {
                // console.log(preliminarArray[0][k]);
                resultArray[k] = preliminarArray[2][k];
            }
        }
        console.log(resultArray);
        render(resultArray)
    } else {
        for (var i = 0; i < preliminarArray.length; i++) {
            for (var k = 0; k < preliminarArray[i].length; k++) {
                console.log(preliminarArray[i].length);
                resultArray[resultArray.length] = preliminarArray[i][k];
            }
        }
        var obj = {};
        for (var i = 0, j = resultArray.length; i < j; i++) {
            obj[resultArray[i].id_gossip] = (obj[resultArray[i].id_gossip] || 0) + 1;
        }
        // console.log(obj);
        var count = 0;
        var i;
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                count++;
            }
        }
        // console.log(count);
        var fuckingFinal = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // console.log(key, obj[key]);
                if (obj[key] == calls) {
                    fuckingFinal.push(getGossipByID(key))
                }
            }
        }
        console.log(fuckingFinal);
        render(fuckingFinal);
    }

}

function searchGossipByUsername(username) {
    var regex = new RegExp(username, "i"),
        searchResult = [],
        j = 0;

    for (var i = 0; i < GossipArray.length; i++) {
        if (regex.test(GossipArray[i].id_usuario)) {
            searchResult[j] = GossipArray[i];
            j++;
        }
        console.log(regex.test(GossipArray[i].id_usuario));
    };
    console.log("search result ", searchResult);
    return searchResult;
}

function searchGossipByContent(content) {
    var regex = new RegExp(content, "i"),
        searchResult = [],
        j = 0;

    for (var i = 0; i < GossipArray.length; i++) {
        if (regex.test(GossipArray[i].de_gossip)) {
            searchResult[j] = GossipArray[i];
            j++;
        }
    };
    return searchResult;
}

function searchGossipByKarma(arg) {
    var searchResult = [],
        j = 0;

    if (arg == 'pos') {
        for (var i = 0; i < GossipArray.length; i++) {
            if (GossipArray[i].ka_gossip > 0) {
                searchResult[j] = GossipArray[i];
                j++;
            }
        }
    } else if (arg == 'neg') {
        for (var i = 0; i < GossipArray.length; i++) {
            if (GossipArray[i].ka_gossip < 0) {
                searchResult[j] = GossipArray[i];
                j++;
            }
        }
    } else {
        for (var i = 0; i < GossipArray.length; i++) {
            if (GossipArray[i].ka_gossip == 0) {
                searchResult[j] = GossipArray[i];
                j++;
            }
        }
    };
    return searchResult;
}

function getGossipUser(id) {
    for (var i = 0; i < GossipArray.length; i++) {
        if (GossipArray[i].id_gossip == id) {
            return GossipArray[i].id_usuario;
        }
    }
}

function getIndexOfGossip(id) {
    for (var i = 0; i < GossipArray.length; i++) {
        if (GossipArray[i].id_gossip == id) {
            return i;
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

function getGossipByID(id){
    for (var i = 0; i < GossipArray.length; i++) {
        if (GossipArray[i].id_gossip == id) {
            return GossipArray[i];
        }
    }
}

function render(gossip) {
    gossipSpawner.innerHTML = 　'';
    for (var i = 0; i < gossip.length; i++) {
        renderOne(gossip[i]);
        if (i < gossip.length) {
            stopProgress();
        }
    }
}

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
        karmaSign = "";

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
    gossipCard.appendChild(cardAction)
    gossipSpawner.appendChild(gossipCard);

}

//-------------------------------------------------------------------------Button functions-----------------------------------------------------------------------

function enterAsAnotherUser() {
    ls.removeItem('username');
    window.location.assign("/");
}
EnterAsAnotherUserButtonM.onclick = enterAsAnotherUser;

//-------------------------------------------------------------------------Main Thread----------------------------------------------------------------------------

getAllGossips();
userChip();
