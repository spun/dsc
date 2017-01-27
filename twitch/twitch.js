/*global ActiveXObject */
/*jslint browser: true */

function getVideoId() {
    "use strict";
    var regExp;
    var match;
    var locationUrl = location.href;

    regExp = /^.*twitch\.tv\/videos\/([0-9]+)*/;
    match = locationUrl.match(regExp);
    if (match) {
        return match[1];
    }
    return false;
}

function createButtonUI(url) {
    'use strict';
    var dsc_button;
    var span;
    var link;
    var dsc_button_menu;

    dsc_button = document.getElementById('dsc-button');
    if (dsc_button !== null) {
        dsc_button.parentNode.removeChild(dsc_button);
    }

    span = document.createElement('span');
    span.id = "dsc-button";
    span.setAttribute('class', 'ember-view');

    link = document.createElement('a');
    link.setAttribute('class', 'button mg-l-1');
    link.textContent = 'Descarga ';
    link.href = url;
    span.appendChild(link);

    document.getElementsByClassName('cn-metabar__more')[0].appendChild(span);

    span.onclick = function () {
        dsc_button_menu = document.getElementById('dsc-list-menu');

        if (dsc_button_menu) {
            if (dsc_button_menu.style.display === 'none') {
                dsc_button_menu.style.display = 'block';
            } else {
                dsc_button_menu.style.display = 'none';
            }
            dsc_button_menu.style.top = link.offsetTop - (dsc_button_menu.offsetHeight + 5) + "px";
            dsc_button_menu.style.left = link.offsetLeft + "px";
        }
    };
}

function getClientId(callback) {
    'use strict';
    var xmlhttp;
    var playerFileUrl = 'https://player.twitch.tv/js/player.js';

    if (XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

            var rawResponseStr = xmlhttp.responseText;
            var re = /\{"Client-ID":"(\w+)"\}/;
            var m = re.exec(rawResponseStr);

            if (m !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex = re.lastIndex + 1;
                }
                callback(m[1]);
            }
        }
    };
    xmlhttp.open("GET", playerFileUrl, true);
    xmlhttp.send();
}

function getVideoUrl(videoId, clientId, callback) {
    'use strict';
    var xmlhttp;
    var signatureAndTokenUrl = 'https://api.twitch.tv/api/vods/' + videoId + '/access_token?client_id=' + clientId + '&format=json';

    if (XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

            var data = JSON.parse(xmlhttp.responseText);
            var signature = data.sig;
            var token = encodeURIComponent(data.token);

            var url = "http://usher.twitch.tv/vod/" + videoId + "?nauthsig=" + signature + "&nauth=" + token;
            callback(url);
        }
    };
    xmlhttp.open("GET", signatureAndTokenUrl, true);
    xmlhttp.send();
}

(function () {
    'use strict';
    var videoId = getVideoId();
    if (videoId) {
        getClientId(function (clientId) {
            getVideoUrl(videoId, clientId, function (url) {
                createButtonUI(url);
            });
        });
    }
}());
