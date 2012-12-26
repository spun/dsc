/*global jQuery: false */

function setHtml5Player(url) {
    "use strict";
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
    "use strict";
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
    "use strict";
    jQuery.ajax({
        type: 'GET',
        url: 'http://www.goear.com/tracker758.php?f=' + audioId,
        dataType: 'html',
        success: function (texto) {
            callback(texto);
        }
    });
}

function processData(rawData) {
    "use strict";
    var audioData = {}, fragmentos, pathfrag, direcc, title, artist;

    fragmentos = rawData.split('path="');
    pathfrag = fragmentos[1].split('"');
    direcc = pathfrag[0];

    fragmentos = rawData.split('title="');
    pathfrag = fragmentos[1].split('"');
    title = pathfrag[0];

    fragmentos = rawData.split('artist="');
    pathfrag = fragmentos[1].split('"');
    artist = pathfrag[0];

    audioData.url = direcc;
    audioData.title = title;
    audioData.artist = artist;
    return audioData;
}

function createButtonUI(audioData) {
    "use strict";
    document.getElementById('report_action').parentNode.parentNode.removeChild(document.getElementById('report_action').parentNode);

    var dwnbox, dwnbutton, texto, dwnlink, position;

    dwnbox = document.createElement('li');
    dwnbutton = document.createElement('button');
    dwnbutton.setAttribute('type', 'button');
    dwnbutton.setAttribute('class', 'btn_action');
    dwnbutton.setAttribute('id', 'share_action');

    texto = document.createTextNode('Descargar');
    dwnbutton.appendChild(texto);

    dwnlink = document.createElement('a');
    dwnlink.setAttribute('href', audioData.url);
    dwnlink.setAttribute('title', 'Haz click con el segundo boton y elige guardar como...');
    dwnlink.setAttribute('class', 'dragout');
    dwnlink.setAttribute('draggable', 'true');
    dwnlink.setAttribute('data-downloadurl', 'audio/mpeg:' + audioData.artist + ' - ' + audioData.title + '.mp3:' + audioData.url);

    dwnlink.onclick = function (e) {
        e.preventDefault();
    };
    dwnlink.ondblclick = function (e) {
        setHtml5Player(this.href);
        e.preventDefault();
    };

    dwnbox.appendChild(dwnlink);
    dwnlink.appendChild(dwnbutton);

    position = document.getElementById('actions');
    position.insertBefore(dwnbox, position.firstChild);

    dwnlink.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('DownloadURL', dwnlink.dataset.downloadurl);
    }, false);
}

(function () {
    "use strict";
    var audioId = getId();
    getAudioData(audioId, function (data) {
        var audioInfo = processData(data);
        createButtonUI(audioInfo);
    });
}());