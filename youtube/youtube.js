/*global ytplayer, escape, videojs*/
/*jslint browser: true */

var formats = {
    "5": {description: "LQ FLV", format: "FLV", extension: "flv"},
    "6": {description: "LQ FLV", format: "FLV", extension: "flv"},
    "13": {description: "LQ 3GP", format: "3GP", extension: "3gp"},
    "17": {description: "LQ 3GP", format: "3GP", extension: "3gp"},
    "18": {description: "LQ MP4", format: "MP4", extension: "mp4"},
    "22": {description: "HD 720p MP4", format: "MP4", extension: "mp4"},
    "34": {description: "LQ FLV", format: "FLV", extension: "flv"},
    "35": {description: "HQ 480p FLV", format: "FLV", extension: "flv"},
    "36": {description: "LQ 3GP", format: "3GP", extension: "3gp"},
    "37": {description: "Full HD 1080 MP4", format: "MP4", extension: "mp4"},
    "38": {description: "Original MP4", format: "MP4", extension: "mp4"},
    "43": {description: "LQ WebM", format: "WebM", extension: "webm"},
    "44": {description: "HQ 480p WebM", format: "WebM", extension: "webm"},
    "45": {description: "HD 720p WebM", format: "WebM", extension: "webm"},
    "46": {description: "Full HD 1080 WebM", format: "WebM", extension: "webm"},
    "82": {description: "LQ MP4 (3D)", format: "MP4", extension: "mp4"},
    "83": {description: "LQ MP4 (3D)", format: "MP4", extension: "mp4"},
    "84": {description: "HD 720p MP4 (3D)", format: "MP4", extension: "mp4"},
    "85": {description: "HQ 520p MP4 (3D)", format: "MP4", extension: "mp4"},
    "100": {description: "LQ WebM (3D)", format: "WebM", extension: "webm"},
    "101": {description: "LQ WebM (3D)", format: "WebM", extension: "webm"},
    "102": {description: "HD 720p WebM (3D)", format: "WebM", extension: "webm"},
    "133": {description: "*LQ 240p MP4", format: "MP4", extension: "mp4"},
    "134": {description: "*MQ 360p MP4", format: "MP4", extension: "mp4"},
    "135": {description: "*HQ 480p MP4", format: "MP4", extension: "mp4"},
    "136": {description: "*HD 720p MP4", format: "MP4", extension: "mp4"},
    "137": {description: "*Full HD 1080 MP4", format: "MP4", extension: "mp4"},
    "138": {description: "*ULTRA HD 4K MP4", format: "MP4", extension: "mp4"},
    "140": {description: "*AUDIO MP4", format: "MP4", extension: "m4a"},
    "160": {description: "*LQ 144p WebM", format: "WebM", extension: "webm"},
    "171": {description: "*AUDIO OGG", format: "OGG", extension: "ogg"},
    "242": {description: "*LQ 240p WebM", format: "WebM", extension: "webm"},
    "243": {description: "*MQ 360p WebM", format: "WebM", extension: "webm"},
    "244": {description: "*HQ 480p WebM", format: "WebM", extension: "webm"},
    "247": {description: "*HD 720p WebM", format: "WebM", extension: "webm"},
    "248": {description: "*Full HD 1080 WebM", format: "WebM", extension: "webm"},
    "264": {description: "*HD 1440p MP4", format: "MP4", extension: "mp4"},
    "298": {description: "*HD 720p MP4 (60fps)", format: "MP4", extension: "mp4"},
    "299": {description: "*Full HD 1080 (60fps)", format: "MP4", extension: "mp4"}
};

function getVideoJs(callback) {
    "use strict";
    var link = document.createElement("link");
    link.href = "https://vjs.zencdn.net/4.10.1/video-js.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    var script = document.createElement("script");
    script.src = "https://vjs.zencdn.net/4.10.1/video.js";
    script.onreadystatechange = function () {
        callback();
    };
    script.onload = script.onreadystatechange;
    document.body.appendChild(script);
}

function setHtml5Player(url, type) {
    "use strict";
    var dsc_video = document.getElementById("dsc_video");
    var source;

    if (dsc_video === null) {
        var video = document.createElement("video");
        video.id = "dsc_video";
        video.setAttribute("class", "video-js vjs-default-skin player-width player-height");

        var videoZone = document.getElementById("player-api");
        while (videoZone.firstChild) {
            videoZone.removeChild(videoZone.firstChild);
        }
        document.getElementById("player-api").appendChild(video);
        video.setAttribute("width", "auto");
        video.setAttribute("height", "auto");

        source = document.createElement("source");
        source.src = url;
        source.type = type;
        video.appendChild(source);

        getVideoJs(function () {
            videojs("dsc_video", {
                "controls": true,
                "autoplay": true,
                "preload": "auto"
            });
        });

        video.onerror = function () {
            var stopTime = video.currentTime;
            var resumeFrom;
            resumeFrom = function () {
                video.currentTime = stopTime;
                video.removeEventListener("canplay", resumeFrom);
            };
            video.addEventListener("canplay", resumeFrom);
            video.play();
        };

    } else {
        source = document.getElementById("dsc_video").childNodes[0];
        source.setAttribute("src", url);
        source.setAttribute("type", type);
    }
}

function createButtonUI() {
    "use strict";

    var dsc_button = document.getElementById("dsc-button");
    if (dsc_button !== null) {
        dsc_button.parentNode.removeChild(dsc_button);
    }

    var span = document.createElement("span");
    span.setAttribute("class", "yt-uix-button-content");
    span.textContent = "Descargar";

    var button = document.createElement("button");
    button.setAttribute("class", "yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup action-panel-trigger action-panel-trigger-overflow yt-uix-tooltip");
    button.type = "button";
    button.onclick = ";return false;";
    button.setAttribute("role", "button");
    button.id = "dsc-button";
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-label", "Menú descarga");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("data-tooltip-text", "Descargar");
    button.title = "Descarga el video";
    button.setAttribute("data-button-menu-id", "dsc-list-menu");
    button.appendChild(span);

    var div = document.createElement("div");
    div.setAttribute("class", "yt-uix-menu");
    div.appendChild(button);

    var actions_bar = document.getElementById("watch8-secondary-actions");
    var first_action_btn = actions_bar.firstChild;
    actions_bar.insertBefore(div, first_action_btn);
}

function createDropDownMenuUI() {
    "use strict";
    var dsc_button_menu = document.getElementById("dsc-list-menu");
    if (dsc_button_menu !== null) {
        dsc_button_menu.parentNode.removeChild(dsc_button_menu);
    }

    var ul = document.createElement("ul");
    ul.setAttribute("class", "flag-menu");

    var div = document.createElement("div");
    div.setAttribute("class", "yt-uix-button-menu yt-uix-button-menu-external hid");
    div.id = "dsc-list-menu";

    div.appendChild(ul);
    document.body.appendChild(div);
}

function addItemToList(data, videoUrl, downloadName) {
    "use strict";
    var description = "";
    var finalFileName = "";
    if (formats[data.itag]) {
        description = formats[data.itag].description + " (" + formats[data.itag].format + ")";
    } else {
        description = "Unknown (" + data.itag + ")";
    }

    var listElement = document.createElement("a");
    listElement.href = videoUrl;
    listElement.textContent = description;
    listElement.setAttribute("class", "yt-uix-button-menu-item");
    if (downloadName) {
        if (formats[data.itag]) {
            finalFileName = downloadName + "." + formats[data.itag].extension;
        }
        listElement.setAttribute("download", finalFileName);
    }
    document.getElementById("dsc-list-menu").childNodes[0].appendChild(listElement);

    var testFormat = document.createElement("video");
    var format = data.type.split(";")[0];
    if (testFormat.canPlayType(format) !== "") {
        var span = document.createElement("span");
        span.setAttribute("class", "label");
        span.textContent = "H5";
        span.title = "Play in HTML5";
        span.setAttribute("videoType", format);
        span.style.position = "absolute";
        span.style.right = "0.6666em";
        span.style.opacity = "0.6";
        span.style.position = "float";
        span.onclick = function () {
            setHtml5Player(span.parentNode.href, span.getAttribute("videoType"));
            return false;
        };
        listElement.appendChild(span);
        listElement.style.paddingRight = "30px";
    }
}

function addSeparator() {
    "use strict";
    var listElement;
    listElement = document.createElement("li");
    listElement.setAttribute("class", "yt-uix-button-menu-new-section-separator");
    document.getElementById("dsc-list-menu").childNodes[0].appendChild(listElement);
}


(function () {
    "use strict";
    createButtonUI();
    createDropDownMenuUI();

    var array_videoData = [];
    var rawData = ytplayer.config.args.url_encoded_fmt_stream_map.split(",");
    var i;
        var j;
    var arg = {};
    var splitData;
    var videoData;
    for (i = 0; i < rawData.length; i = i + 1) {
        arg = {};
        splitData = rawData[i].split("&");
        for (j = 0; j < splitData.length; j = j + 1) {
            videoData = splitData[j].split("=");
            arg[decodeURIComponent(videoData[0])] = decodeURIComponent(videoData.slice(1).join("="));
        }
        array_videoData.push(arg);
    }

    var video_title = escape(ytplayer.config.args.title.replace(/"/g, ""));
    
    var videoUrl;
    for (i = 0; i < array_videoData.length; i = i + 1) {
        videoUrl = decodeURIComponent(array_videoData[i].url + "&signature=" + array_videoData[i].sig) + "&title=" + video_title;
        addItemToList(array_videoData[i], videoUrl);
    }

    addSeparator();
    var rawNewData = ytplayer.config.args.adaptive_fmts.split(",");
    for (i = 0; i < rawNewData.length; i = i + 1) {
        arg = {};
        splitData = rawNewData[i].split("&");
        for (j = 0; j < splitData.length; j = j + 1) {
            videoData = splitData[j].split("=");
            arg[decodeURIComponent(videoData[0])] = decodeURIComponent(videoData.slice(1).join("="));
        }
        addItemToList(arg, arg.url, decodeURIComponent(video_title));
    }

}());
