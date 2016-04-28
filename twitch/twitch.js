/*global ActiveXObject */
/*jslint browser: true */

function getVideoId() {
    "use strict";
    var regExp;
    var match;
    var locationUrl = location.href;

    regExp = /^.*(twitch\.tv\/[\w]+\/[b\|c\|v]\/)([0-9]+)*/;
    match = locationUrl.match(regExp);
    if (match) {
        return match[2];
    }
    return false;
}

function createButtonUI(url) {
    'use strict';
    var dsc_button, span, link, dsc_button_menu;

    dsc_button = document.getElementById('dsc-button');
    if (dsc_button !== null) {
        dsc_button.parentNode.removeChild(dsc_button);
    }

    span = document.createElement('span');
    span.id = "dsc-button";
    span.setAttribute('class', 'ember-view');

    link = document.createElement('a');
    link.setAttribute('class', 'button glyph-only');
    link.textContent = 'Descarga ';
    link.href = url;
    span.appendChild(link);

    document.getElementsByClassName('channel-actions')[0].appendChild(span);

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

function getVideoUrl(videoId, callback) {
    'use strict';
    var xmlhttp, yql = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="https://api.twitch.tv/api/vods/' + videoId + '/access_token"') + '&format=json';

    if (XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var data = JSON.parse(xmlhttp.responseText).query.results.json;
            var signature = data.sig;
            var token = encodeURIComponent(data.token);

            var url = "http://usher.twitch.tv/vod/" + videoId + "?nauthsig=" + signature + "&nauth=" + token;
            callback(url);
        }
    };
    xmlhttp.open("GET", yql, true);
    xmlhttp.send();
}

(function () {
    'use strict';
    var id = getVideoId();
    if (id) {
        getVideoUrl(id, function (url) {
            createButtonUI(url);
        });
    }
}());
