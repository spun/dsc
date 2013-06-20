/*global ytplayer: false, escape: false, '_V_': false*/
/*jslint browser: true */

var formats = {
    5:   {description: "LQ FLV", format: "FLV" },
    6:   {description: "LQ FLV", format: "FLV" },
    13:  {description: "LQ 3GP", format: "3GP" },
    17:  {description: "LQ 3GP", format: "3GP" },
    18:  {description: "LQ MP4", format: "MP4" },
    22:  {description: "HD 720p MP4", format: "MP4" },
    34:  {description: "LQ FLV", format: "FLV" },
    35:  {description: "HQ 480p FLV", format: "FLV" },
    36:  {description: "LQ 3GP", format: "3GP" },
    37:  {description: "Full HD 1080 MP4", format: "MP4" },
    38:  {description: "Original MP4", format: "MP4" },
    43:  {description: "LQ WebM", format: "WebM" },
    44:  {description: "HQ 480p WebM", format: "WebM" },
    45:  {description: "HD 720p WebM", format: "WebM" },
    46:  {description: "Full HD 1080 WebM", format: "WebM" },
    82:  {description: "LQ MP4 (3D)", format: "MP4" },
    83:  {description: "LQ MP4 (3D)", format: "MP4" },
    84:  {description: "HD 720p MP4 (3D)", format: "MP4" },
    85:  {description: "HQ 520p MP4 (3D)", format: "MP4" },
    100: {description: "LQ WebM (3D)", format: "WebM" },
    101: {description: "LQ WebM (3D)", format: "WebM" },
    102: {description: "HD 720p WebM (3D)", format: "WebM" }
};

function getVideoJs(callback) {
    "use strict";
    var script, link = document.createElement("link");
    link.href = "https://vjs.zencdn.net/c/video-js.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    script = document.createElement("script");
    script.src = "https://vjs.zencdn.net/c/video.js";
    script.onload = script.onreadystatechange = function () { callback(); };
    document.body.appendChild(script);
}

function setHtml5Player(url, type) {
    "use strict";
    var video, source, dsc_video = document.getElementById('dsc_video');

    if (dsc_video === null) {
        video = document.createElement('video');
        video.id = 'dsc_video';
        video.controls = 'controls';
        video.autoplay = 'autoplay';
        video.setAttribute('class', 'video-js vjs-default-skin');
        document.getElementById('player').appendChild(video);
        document.getElementById('player-api').parentNode.removeChild(document.getElementById("player-api"));
        video.setAttribute('width', '640');
        video.setAttribute('height', '390');

        source = document.createElement('source');
        source.src = url;
        source.type = type;
        video.appendChild(source);

        getVideoJs(function () {
            _V_('dsc_video');
        });
    } else {
        source = document.getElementById('dsc_video').childNodes[0];
        source.setAttribute('src', url);
        source.setAttribute('type', type);
    }
}

function createButtonUI() {
    "use strict";
    var dsc_button, image, button, span, btn_reference;

    dsc_button = document.getElementById('dsc-button');
    if (dsc_button !== null) {
        dsc_button.parentNode.removeChild(dsc_button);
    }

    image = document.createElement('img');
    image.setAttribute('class', 'yt-uix-button-arrow');
    image.src = '//s.ytimg.com/yt/img/pixel-vfl73.gif';
    image.alt = '';

    button = document.createElement('button');
    button.type = 'button';
    button.id = "dsc-button";
    button.onclick = ";return false;";
    button.setAttribute('class', 'yt-uix-button yt-uix-button-default');
    button.title = 'Descarga el video';
    button.setAttribute('data-button-menu-id', 'dsc-list-menu');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-expanded', 'false');
    button.style.marginLeft = '10px';

    span = document.createElement('span');
    span.setAttribute('class', 'yt-uix-button-content');
    span.textContent = 'Descargar ';

    button.appendChild(span);
    button.appendChild(image);

    btn_reference = document.getElementsByClassName('yt-uix-overlay')[0];
    btn_reference.parentNode.insertBefore(button, btn_reference);
}

function createDropDownMenuUI() {
    "use strict";
    var ul, div, dsc_button_menu = document.getElementById('dsc-list-menu');
    if (dsc_button_menu !== null) {
        dsc_button_menu.parentNode.removeChild(dsc_button_menu);
    }

    ul = document.createElement('ul');
    ul.setAttribute('class', 'flag-menu');

    div = document.createElement('div');
    div.setAttribute('class', 'yt-uix-button-menu yt-uix-button-menu-external hid');
    div.id = 'dsc-list-menu';

    div.appendChild(ul);
    document.body.appendChild(div);
}

function addItemToList(data, videoUrl) {
    "use strict";
    var description = "", listElement, testFormat, format, span;
    if (formats[data.itag]) {
        description = formats[data.itag].description + ' (' + formats[data.itag].format + ')';
    } else {
        description = "Desconocido (" + data.itag + ")";
    }

    listElement = document.createElement('a');
    listElement.href = videoUrl;
    listElement.textContent = description;
    listElement.setAttribute('class', 'yt-uix-button-menu-item');
    document.getElementById('dsc-list-menu').childNodes[0].appendChild(listElement);

    testFormat = document.createElement('video');
    format = data.type.split(';')[0];
    if (testFormat.canPlayType(format) !== "") {
        span = document.createElement('span');
        span.setAttribute('class', 'label');
        span.textContent = 'H5';
        span.title = 'Play in HTML5';
        span.setAttribute('videoType', format);
        span.style.position = 'absolute';
        span.style.right = '0.6666em';
        span.style.opacity = '0.6';
        span.style.position = 'float';
        span.onclick = function () {
            setHtml5Player(this.parentNode.href, this.getAttribute('videoType'));
            return false;
        };
        listElement.appendChild(span);
        listElement.style.paddingRight = '30px';
    }
}

(function () {
    "use strict";
    createButtonUI();
    createDropDownMenuUI();

    var rawData, arg, splitData, i, j, video_title, videoData, videoUrl, array_videoData = [];
    rawData = ytplayer.config.args.url_encoded_fmt_stream_map.split(",");
    for (i = 0; i < rawData.length; i = i + 1) {
        arg = {};
        splitData = rawData[i].split("&");
        for (j = 0; j < splitData.length; j = j + 1) {
            videoData = splitData[j].split("=");
            arg[decodeURIComponent(videoData[0])] = decodeURIComponent(videoData.slice(1).join("="));
        }
        array_videoData.push(arg);
    }

    video_title = escape(ytplayer.config.args.title.replace('"', ''));
    for (i = 0; i < array_videoData.length; i = i + 1) {
        videoUrl = decodeURIComponent(array_videoData[i].url + '&signature=' + array_videoData[i].sig) + '&title=' + video_title;
        addItemToList(array_videoData[i], videoUrl);
    }
}());