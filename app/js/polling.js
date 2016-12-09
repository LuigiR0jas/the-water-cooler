var gossipArray = [],
    userType,
    serverUrl = 'http://gossip-app.herokuapp.com';

onmessage = function(e) {
    gossipArray = e.data[0];
    userType = e.data[1];
}

/*setInterval(*/function kek() {
    let XHR = new XMLHttpRequest(),
        url;
    if (userType == "user") {
        url = serverUrl + '/gossip/all';
    } else {
        url = serverUrl + '/admin/gossip/all'
    }
    XHR.open('get', url, 'true');
    XHR.send();
    XHR.onload = function(res) {
        let getAllResponse = JSON.parse(res.target.response),
        newGossipArray = getAllResponse.gossips;
        console.log(gossipArray);
        console.log(newGossipArray);
        console.log("length of old array: ", gossipArray.length, ". Length of new array: ", newGossipArray.length);
        if (gossipArray.length + 1 < newGossipArray.length) {
            postMessage(newGossipArray);
        }
    }
}//, 5000)

kek();
