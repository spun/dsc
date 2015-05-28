/*global ActiveXObject: false */
/*jslint browser: true, regexp: true */

function getVideoId() {
    "use strict";
    var regExp, match, locationUrl = location.href;

    regExp = /^.*(twitch\.tv\/[\w]+\/[b|c]\/)([0-9]+)*/;
    match = locationUrl.match(regExp);
    if (match) {
        return match[2];
    }
    return false;
}

function createButtonUI() {
    'use strict';
    var dsc_button, button, span, dsc_button_menu;

    dsc_button = document.getElementById('dsc-button');
    if (dsc_button !== null) {
        dsc_button.parentNode.removeChild(dsc_button);
    }

    button = document.createElement('a');
    button.id = "dsc-button";
    button.href = "#";
    button.setAttribute('class', 'dropdown_static action');

    span = document.createElement('span');
    span.textContent = 'Descarga ';

    button.appendChild(span);
    document.getElementById('channel_actions').appendChild(button);

    button.onclick = function () {
        dsc_button_menu = document.getElementById('dsc-list-menu');

        if (dsc_button_menu.style.display === 'none') {
            dsc_button_menu.style.display = 'block';
        } else {
            dsc_button_menu.style.display = 'none';
        }
        dsc_button_menu.style.top = button.offsetTop - (dsc_button_menu.offsetHeight + 5) + "px";
        dsc_button_menu.style.left = button.offsetLeft + "px";
    };
}

function createDropDownMenuUI() {
    'use strict';
    var div, dsc_button_menu = document.getElementById('dsc-list-menu');
    if (dsc_button_menu !== null) {
        dsc_button_menu.parentNode.removeChild(dsc_button_menu);
    }

    div = document.createElement('div');
    div.setAttribute('class', 'dropmenu menu-like');
    div.id = 'dsc-list-menu';
    div.style.position = 'absolute';
    div.style.top = '752px';
    div.style.left = '484px';
    div.style.outline = 'none';
    div.style.display = 'none';

    document.getElementsByClassName('tse-content')[1].appendChild(div);
}


function addSectionToList(text) {
    'use strict';
    var listElement;

    listElement = document.createElement('label');
    listElement.style.textAlign = "center";
    listElement.textContent = text;

    document.getElementById('dsc-list-menu').appendChild(listElement);
}


function addItemToList(numElement, videoUrl) {
    'use strict';
    var listElement, elementLink;

    listElement = document.createElement('span');
    listElement.setAttribute('class', 'hide-owner');

    elementLink = document.createElement('a');
    elementLink.setAttribute('class', 'dropmenu_action');
    elementLink.href = videoUrl;
    elementLink.textContent = 'Part ' + numElement;
    elementLink.download = 'Part ' + numElement;

    listElement.appendChild(elementLink);

    document.getElementById('dsc-list-menu').appendChild(listElement);
}

function getVideoUrls(videoId, callback) {
    'use strict';
    var listaVideos, xmlhttp, yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="https://api.twitch.tv/api/videos/a' + videoId + '.xml"') + '&format=json';

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            listaVideos = JSON.parse(xmlhttp.responseText).query.results.json.chunks;
            callback(listaVideos);
        }
    };
    xmlhttp.open("GET", yql, true);
    xmlhttp.send();
}

(function () {
    'use strict';
    var i, videos, numVideos, id = getVideoId();
    if (id) {
        createDropDownMenuUI();
        getVideoUrls(id, function (list) {

            var formatVideos;
            for (formatVideos in list) {
                if (list.hasOwnProperty(formatVideos)) {

                    addSectionToList(formatVideos);   // Separator

                    videos =  list[formatVideos];
                    // Multiple videos
                    if (videos[0]) {

                        numVideos = videos.length;
                        for (i = 0; i < numVideos; i = i + 1) {
                            addItemToList(i + 1, videos[i].url);
                        }

                    } else {    // One video
                        addItemToList(1, videos.url);
                    }
                }
            }
            createButtonUI();
        });
    }
}());