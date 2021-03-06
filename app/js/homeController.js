//Homepage JS Controller
//----------------------------------------------------------------------Global Variables------------------------------------------------------------------------

var gossipSpawner = document.getElementById('gossipSpawner'),
    EnterAsUserButtonM = document.getElementById('EnterAsUserButtonM'),
    EnterAsAdminButtonM = document.getElementById('EnterAsAdminButtonM'),
    ReadLogsButtonM = document.getElementById('ReadLogsButtonM'),
    gossipText = document.getElementById('gossipText'),
    publishGossipBtn = document.getElementById('PublishGossipBtn'),
    ls = window.localStorage,
    ss = window.sessionStorage,
    serverUrl = 'http://gossip-app.herokuapp.com',
    GossipArray = [],
    AdminGossipArray = [],
    banner, progress, indeterminate, lel,
    black = false,
    pollingWorker = new Worker("/polling");

// -------------------------------------------------------------------Initial Functions--------------------------------------------------------------

//Materialize JQuery Modal initialization
$(document).ready(function() {
    $('.modal-trigger').leanModal();
});

function getUser() {
    return ls.getItem('username');
}

function checkIfAdmin() {
    return ls.getItem('adminCredentials');
}

function getAdmin() {
    var arr = ls.getItem('adminCredentials');
    var name = arr.split(",");
    return name[0];
}

function userChip() {
    var chip = document.getElementById("userChip"),
        user = getUser();
    chip.innerHTML = user;
}

function adminChip() {
    var chip = document.getElementById("userChip"),
        user = getAdmin();
    chip.innerHTML = user + " (Admin)";
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
        pollingWorker.postMessage([GossipArray, "user"]);
        console.log("GossipArray sent to worker");
    }
}

function getAllAsAdmin() {
    startProgress();
    let XHR = new XMLHttpRequest();
    let url = serverUrl + '/admin/gossip/all';
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        let getAllResponse = JSON.parse(res.target.response);
        AdminGossipArray = (getAllResponse.gossips)
        render(AdminGossipArray);
        pollingWorker.postMessage([AdminGossipArray, "admin"]);
        console.log("GossipArray sent to worker");
    }
}

function eraseGossipSelf(id, user) {
    let XHR = new XMLHttpRequest(),
        tuser = getUser(),
        url = serverUrl + '/gossip/delete?id_gossip=' + id + '&id_usuario=' + tuser;
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        deleteResponse = JSON.parse(res.target.response);
        if (deleteResponse.status == 200) {
            if (checkIfAdmin()) {
                let status = ["status", id].join("_"),
                    userid = getGossipUser(id),
                    dinamoID = ["Erase", id, userid].join("_"),
                    statu = document.getElementById(status),
                    dinamoButton = document.getElementById(dinamoID);
                console.log(dinamoButton);
                console.log(dinamoID);
                dinamoButton.name = "retrieveBtn";　
                dinamoButton.id = ["Retrieve", id, user].join("_");
                dinamoButton.innerHTML = '<i class="material-icons">loop</i>';
                dinamoButton.onclick = extractId;
                statu.style.color = "red";
                statu.innerHTML = "(Eliminado)";
                statu.id = ["status", id].join("_")
                Materialize.toast(deleteResponse.message, 2000);
            } else {
                let cardId = ["Card", id, user].join("_"),
                    gossipCardo = document.getElementById(cardId),
                    index = getIndexOfGossip(id);
                GossipArray.splice(index, 1);
                gossipCardo.style.display = "none";
                Materialize.toast(deleteResponse.message, 2000);
            }
        } else {
            Materialize.toast('A ' + deleteResponse.status + ' error ocurred: ' + deleteResponse.message, 2000);
        }
    }
}

function eraseGossip(id, user) {
    let XHR = new XMLHttpRequest(),
        tuser = getUser(),
        url = serverUrl + '/admin/gossip/delete?id_gossip=' + id + '&id_usuario=' + tuser;
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        deleteResponse = JSON.parse(res.target.response);
        if (deleteResponse.status == 200) {
            let status = ["status", id].join("_"),
                userid = getGossipUser(id),
                dinamoID = ["Erase", id, user].join("_"),
                statu = document.getElementById(status),
                dinamoButton = document.getElementById(dinamoID);
            console.log(dinamoButton);
            console.log(dinamoID);
            dinamoButton.name = "retrieveBtn";　
            dinamoButton.id = ["Retrieve", id, user].join("_");
            dinamoButton.innerHTML = '<i class="material-icons">loop</i>';
            dinamoButton.onclick = extractId;
            statu.style.color = "red";
            statu.innerHTML = "(Eliminado)";
            statu.id = ["status", id].join("_")
            Materialize.toast(deleteResponse.message, 2000);
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
            url = serverUrl + '/gossip/create';
        if (checkIfAdmin()) {
            var user = getAdmin();
        } else {
            var user = getUser();
        }
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
            if (checkIfAdmin()) {
                AdminGossipArray.push(newGossip)
            } else {
                GossipArray.push(newGossip)
            }
            Materialize.toast(createResponse.message, 2000);
        }
    }
}
publishGossipBtn.onclick = createGossip;

function setKarma(action, id) {
    let XHR = new XMLHttpRequest(),
        url = serverUrl + '/gossip/' + action;
    if (checkIfAdmin()) {
        var user = getAdmin();
    } else {
        var user = getUser();
    }
    params = {
        id_usuario: user,
        id_gossip: id
    };
    XHR.open('post', url, 'true');
    XHR.setRequestHeader('Content-Type', 'application/json');
    XHR.send(JSON.stringify(params));
    XHR.onload = function(res) {
        let karmaResponse = JSON.parse(res.target.response);
        renderKarma(action, id);
        Materialize.toast(karmaResponse.message, 2000);
    }
}

function getLogs() {
    let XHR = new XMLHttpRequest();
    let url = serverUrl + '/admin/log/all';
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        let getAllLogsResponse = JSON.parse(res.target.response);
        LogsArray = (getAllLogsResponse.logs)
        renderLogs(LogsArray);
    }
}

function recoverGossip(id, idUsuario) {
    let XHR = new XMLHttpRequest(),
        url = serverUrl + '/admin/gossip/recover',
        user = getAdmin();
    params = {
        id_usuario: user,
        id_gossip: id
    };
    XHR.open('post', url, 'true');
    XHR.setRequestHeader('Content-Type', 'application/json');
    XHR.send(JSON.stringify(params));
    XHR.onload = function(res) {
        let recoverResponse = JSON.parse(res.target.response),
            dinamoID = ["Retrieve", id, idUsuario].join('_');
        console.log(dinamoID);
        let dinamoButton = document.getElementById(dinamoID),
            status = ["status", id].join("_");
        let statu = document.getElementById(status);
        statu.innerHTML = " ";
        statu.id = ["status", id].join("_");
        dinamoButton.name = "EraseBtn"
        dinamoButton.id = ["Erase", id, idUsuario].join("_");
        dinamoButton.innerHTML = '<i class="material-icons">close</i>';
        dinamoButton.onclick = eraseMiddleware;
        Materialize.toast(recoverResponse.message, 2000);
    }
}
//----------------------------------------------------------------------Various functions-------------------------------------------------------------------------

function buttonsRenders() {
    if (checkIfAdmin()) {
        var EnterAsAnotherUserButtonM = document.getElementById('EnterAsAnotherUserButtonM'),
            EnterAsAdminButtonM = document.getElementById('EnterAsAdminButtonM');

        EnterAsAnotherUserButtonM.style.display = "none";
        EnterAsAdminButtonM.style.display = "none"

    } else {
        var ReadLogsButtonM = document.getElementById('ReadLogsButtonM'),
            EnterAsUserButtonM = document.getElementById('EnterAsUserButtonM');

        ReadLogsButtonM.style.display = "none";
        EnterAsUserButtonM.style.display = "none";
    }
}

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
    if (checkIfAdmin()) {
        var arr = AdminGossipArray;
    } else {
        var arr = GossipArray;
    }
    for (var i = 0; i < arr.length; i++) {
        if (regex.test(arr[i].id_usuario)) {
            searchResult[j] = arr[i];
            j++;
        }
        console.log(regex.test(arr[i].id_usuario));
    };
    console.log("search result ", searchResult);
    return searchResult;
}

function searchGossipByContent(content) {
    var regex = new RegExp(content, "i"),
        searchResult = [],
        j = 0;
    if (checkIfAdmin()) {
        var arr = AdminGossipArray;
    } else {
        var arr = GossipArray;
    }

    for (var i = 0; i < arr.length; i++) {
        if (regex.test(arr[i].de_gossip)) {
            searchResult[j] = arr[i];
            j++;
        }
    };
    return searchResult;
}

function searchGossipByKarma(arg) {
    var searchResult = [],
        j = 0;
    if (checkIfAdmin()) {
        var arr = AdminGossipArray;
    } else {
        var arr = GossipArray;
    }

    if (arg == 'pos') {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].ka_gossip > 0) {
                searchResult[j] = arr[i];
                j++;
            }
        }
    } else if (arg == 'neg') {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].ka_gossip < 0) {
                searchResult[j] = arr[i];
                j++;
            }
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].ka_gossip == 0) {
                searchResult[j] = arr[i];
                j++;
            }
        }
    };
    return searchResult;
}

function getGossipUser(id) {
    if (checkIfAdmin()) {
        var arr = AdminGossipArray;
    } else {
        var arr = GossipArray
    }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id_gossip == id) {
            return arr[i].id_usuario;
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

function extractId() {
    let idArr = this.id.split("_");
    recoverGossip(idArr[1], idArr[2]);
}

function getGossipByID(id) {
    if (checkIfAdmin()) {
        var arr = AdminGossipArray;
    } else {
        var arr = GossipArray;
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id_gossip == id) {
            return arr[i];
        }
    }
}

function eraseMiddleware() {
    let idArr = this.id.split("_");
    if (checkIfAdmin()) {
        eraseGossip(idArr[1], idArr[2]);
    } else {
        eraseGossipSelf(idArr[1], idArr[2]);
    }
}

function karma(k) {
    console.log(k);
    console.log(this);
    let idArr = this.id.split("_");
    console.log(idArr[0], 'for ', idArr[1]);
    setKarma(idArr[0], idArr[1])
}

//---------------------------------------------------------------------------Render Functions -------------------------------------------------------------------------
function renderLogs(logs) {
    var logSpawner = document.getElementById("LogSpawner");
    for (var i = 0; i < logs.length; i++) {
        let p = document.createElement("p"),
            divider = document.createElement("div")
        p.innerHTML = "[Entrada No. " + logs[i].id_gossip_log + ", " + logs[i].da_gossip_log + "]: " + logs[i].de_gossip_log;
        divider.className = "divider";
        logSpawner.appendChild(p);
        logSpawner.appendChild(divider);
    }
}

function renderKarma(action, id) {
    let string = "chip_" + id;
    console.log(string);
    let chip = document.getElementById(string),
        karmaColor,
        karmaSign = '';
    value = parseInt(chip.innerHTML);

    if (action == "up") {
        value++;
    } else {
        value--;
    }

    if (value > 0) {
        karmaColor = "cyan";
        karmaSign = "+";

    } else if (value < 0) {
        karmaColor = "red";

    } else {
        karmaColor = "grey darken-2"
    }
    chip.innerHTML = karmaSign + "" + value;
    chip.className = "chip " + karmaColor + " white-text";
}

function render(gossip) {
    gossipSpawner.innerHTML = 　'';
    var newArray = gossip.sort(function(a, b) {
        return b.id_gossip - a.id_gossip;
    });

    for (var i = 0; i < newArray.length; i++) {
        renderOne(newArray[i]);
        if (i < newArray.length) {
            stopProgress();
        }
    }
}

function renderOne(gossip) {
    var cardColor,
        karmaColor,
        textColor,
        karmaSign,
        none = false,
        yeah = false,
        status = " ";

    if (checkIfAdmin()) {
        yeah = true;
        if (gossip.id_gossip_status == 0) {
            status = "(Eliminado)";
            none = true;
        }
    }

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

    let statu = document.createElement("p");
    statu.id = "status_" + gossip.id_gossip;
    statu.innerHTML = " " + status;
    statu.style.color = "red";
    statu.style.float = "right"

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

    let dinamoButton = document.createElement("a");
    dinamoButton.className = "waves-effect btn-flat " + textColor + " right EraseBtn";

    if (none) {
        dinamoButton.name = "retrieveBtn"
        dinamoButton.id = ["Retrieve", gossip.id_gossip, gossip.id_usuario].join("_");
        dinamoButton.innerHTML = '<i class="material-icons">loop</i>';
        dinamoButton.onclick = extractId;
    } else {
        dinamoButton.name = "EraseBtn"
        dinamoButton.id = ["Erase", gossip.id_gossip, gossip.id_usuario].join("_");
        dinamoButton.innerHTML = '<i class="material-icons">close</i>';
        dinamoButton.onclick = eraseMiddleware;
    }


    let gossipContent = document.createElement("p");
    gossipContent.innerHTML = gossip.de_gossip;

    let cardAction = document.createElement("div");
    cardAction.className = "card-action";

    let posKarma = document.createElement("a");
    posKarma.className = "waves-effect white-text cyan btn-large"
    posKarma.innerHTML = '<i class="material-icons">exposure_plus_1</i>'
    posKarma.id = "up_" + gossip.id_gossip;
    posKarma.onclick = karma;

    let negKarma = document.createElement("a");
    negKarma.className = "waves-effect white-text red btn-large"
    negKarma.innerHTML = '<i class="material-icons">exposure_minus_1</i>'
    negKarma.id = "down_" + gossip.id_gossip;
    negKarma.onclick = karma;

    let chip = document.createElement("div");
    chip.className = "chip " + karmaColor + " white-text";
    chip.id = "chip_" + gossip.id_gossip;
    chip.innerHTML = karmaSign + gossip.ka_gossip;

    //--------------------------------Append Hell -------------------------------------

    cardAction.appendChild(posKarma);
    cardAction.appendChild(negKarma);
    cardAction.appendChild(chip);
    cardTitle.appendChild(statu);
    divRow.appendChild(cardTitle);
    divRow.appendChild(dinamoButton);
    cardContent.appendChild(divRow);
    cardContent.appendChild(gossipContent);
    gossipCard.appendChild(cardContent);
    gossipCard.appendChild(cardAction)
    gossipSpawner.appendChild(gossipCard);
}

//-------------------------------------------------------------------------Button functions-----------------------------------------------------------------------

function enterAsAnotherUser() {
    if (checkIfAdmin()) {
        ls.removeItem('adminCredentials');
    }
    ls.removeItem('username');
    window.location.assign("/");
}
EnterAsAnotherUserButtonM.onclick = enterAsAnotherUser;
EnterAsUserButtonM.onclick = enterAsAnotherUser;

function enterAsAdmin() {
    ls.removeItem('username');
    window.location.assign("/admin")
}
EnterAsAdminButtonM.onclick = enterAsAdmin;



//-------------------------------------------------------------------------Main Thread----------------------------------------------------------------------------

function init() {
    if (checkIfAdmin()) {
        getAllAsAdmin();
        adminChip();
    } else {
        getAllGossips();
        userChip();
    }
    buttonsRenders();
    getLogs();
    pollingWorker.onmessage = function(oEvent) {
        console.log("Called back by worker");
        console.log(oEvent);
    }
}
init();
