/*global ActiveXObject */
/*jslint browser: true, for: true */

function setHtml5Player(url) {
    'use strict';
    var audio, dsc_audio = document.getElementById('dsc_audio');

    if (dsc_audio === null) {
        audio = document.createElement('audio');
        audio.id = 'dsc_audio';
        audio.controls = 'controls';
        audio.autoplay = 'autoplay';
        audio.src = url;
        audio.style.margin = '25px 15px';
        document.getElementById('player').insertBefore(audio, document.getElementById('player').childNodes[0]);
        document.getElementById('song_player').parentNode.removeChild(document.getElementById('song_player'));
    } else {
        dsc_audio.src = url;
    }
}

function getId() {
    'use strict';
    var id, url, splitUrl, count, i;
    url = location.href;
    splitUrl = url.split('/');
    count = splitUrl.length;

    for (i = 0; i < count; i = i + 1) {
        if (splitUrl[i] === 'listen') {
            id = splitUrl[i + 1];
        }
    }
    return id;
}

function getAudioData(audioId, callback) {
    'use strict';
    var xmlhttp, yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent("select * from xml where url='http://www.goear.com/playersong/" + audioId + "' and itemPath='playlists.playlist.track'") + '&format=json';

    if (XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var result = JSON.parse(xmlhttp.responseText).query.results.track;
            callback(result);
        }
    };
    xmlhttp.open("GET", yql, true);
    xmlhttp.send();

}


function createButtonUI(audioData) {
    'use strict';

    var dwnbox, dwnlink, position;

    dwnbox = document.createElement('li');

    dwnlink = document.createElement('a');
    dwnlink.textContent = 'Descargar';
    dwnlink.setAttribute('href', audioData.href);
    dwnlink.setAttribute('title', 'Haz click con el segundo boton y elige guardar como...');
    dwnlink.setAttribute('class', 'dragout');
    dwnlink.setAttribute('download', audioData.title);
    dwnlink.setAttribute('draggable', 'true');
    dwnlink.setAttribute('data-downloadurl', 'audio/mpeg:' + audioData.title + '.mp3:' + audioData.href);

    dwnlink.ondblclick = function (e) {
        setHtml5Player(dwnlink.href);
        e.preventDefault();
        e.stopPropagation();
    };

    dwnbox.appendChild(dwnlink);

    position = document.getElementsByClassName('actions')[0];
    if (!position && document.getElementById('maincontent') !== null) {
        var iframe = document.getElementById('maincontent');
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        position = innerDoc.getElementsByClassName('actions')[0];
    }
    position.insertBefore(dwnbox, position.firstChild);

    dwnlink.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('DownloadURL', dwnlink.dataset.downloadurl);
    }, false);
}

(function () {
    'use strict';
    var audioId = getId();
    getAudioData(audioId, function (audioInfo) {
        createButtonUI(audioInfo);
    });
}());