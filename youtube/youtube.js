var formats = {
    5:  {description: "LQ FLV", format: "FLV" },
    18: {description: "LQ MP4", format: "MP4" },
    22: {description: "HD 720p MP4", format: "MP4" },
    34: {description: "LQ FLV", format: "FLV" },
    35: {description: "HQ 480p FLV", format: "FLV" },
    37: {description: "Full HD 1080 MP4", format: "MP4" },
    38: {description: "Original MP4", format: "MP4" },
    43: {description: "LQ WebM", format: "WebM"},
    44: {description: "HQ 480p WebM", format: "WebM"},
    45: {description: "HD 720p WebM", format: "WebM"},
    46: {description: "Full HD 1080 WebM", format: "WebM"}
};

function testJquery(callback) {
    "use strict";
    if (typeof jQuery === 'undefined') {
        var script = document.createElement("script");
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js";
        script.onload = script.onreadystatechange = function () { callback(); };
        document.body.appendChild(script);
    } else {
        callback();
    }
}


function getVideoId(locationUrl) {
    "use strict";
    var regExp, match, host, a = document.createElement('a');
    a.href = locationUrl;
    host = a.hostname;

    if (host.substr(host.length - 11) === "youtube.com" && host !== "m.youtube.com") {
        regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        match = locationUrl.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
    }
    return false;
}


function getVideoData(videoId, callback) {
    "use strict";
    jQuery.ajax({
        url: 'http://www.youtube.com/get_video_info?&video_id=' + videoId,
        success: function (response) {
            var decode_response,  array_urls, num_urls, video_datas, data, i, parameters, j, ab;

            decode_response = decodeURIComponent(decodeURIComponent(decodeURIComponent(response)));
            array_urls = decode_response.split(',itag=');

            num_urls = array_urls.length;
            video_datas = [];

            for (i = 0; i < num_urls; i = i + 1) {
                data = {};
                if (array_urls[i]) {
                    parameters = array_urls[i].split(/\?|&|;\++/);
                    for (j = 0; j < parameters.length; j = j + 1) {
                        ab = parameters[j].split(/\=(.+)/);
                        data[ab[0]] = ab[1];
                    }
                    video_datas.push(data);
                }
            }
            callback(video_datas);
        }
    });
}


function createVideoUrl(videoObject, videoTitle) {
    "use strict";
    var url, sparams, param;

    url = videoObject.url + "?";
    url += "sparams=" + videoObject.sparams;
    sparams = videoObject.sparams.split(',');

    for (param = 0; param < sparams.length; param = param + 1) {
        url += "&" + sparams[param] + "=" + videoObject[sparams[param]];
    }

    url += "&signature=" + videoObject.sig;
    url += "&mv=" + videoObject.mv;
    url += "&sver=" + videoObject.sver;
    url += "&mt=" + videoObject.mt;
    url += "&key=" + videoObject.key;

    url += "&title=" + videoTitle;

    return url;
}


function setHtml5Player(url) {
    "use strict";
    if (jQuery('#dsc_video').length === 0) {
        jQuery('<video>', {
            id: 'dsc_video',
            src: url,
            controls: 'controls',
            autoplay: 'autoplay',
            width: 640,
            height: 390
        }).appendTo(jQuery('#watch-player').parent());
        document.getElementById('watch-player').parentNode.removeChild(document.getElementById("watch-player"));
    } else {
        jQuery('#dsc_video').attr('src', url);
    }
}


function createButtonUI() {
    "use strict";

    if (jQuery("#dsc-button")) {
        jQuery("#dsc-button").remove();
    }

    jQuery('<img/>', {
        'class': 'yt-uix-button-arrow',
        src: '//s.ytimg.com/yt/img/pixel-vfl73.gif',
        alt: ''
    }).appendTo(jQuery('<button>', {
        type: 'button',
        id: "dsc-button",
        onclick: ";return false;",
        'class': 'yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip',
        title: 'Descarga el video',
        html: '<span class="yt-uix-button-content">Descargar </span>',
        "data-button-menu-id": "dsc-list-menu",
        role: "button",
        "aria-pressed": "false",
        "aria-expanded": "false"
    }).appendTo('#watch-actions'));
}


function createDropDownMenuUI() {
    "use strict";

    if (jQuery("#dsc-list-menu")) {
        jQuery("#dsc-list-menu").remove();
    }

    jQuery('<ul>', {
        'class': 'flag-menu'
    }).appendTo(jQuery('<div>', {
        'class': 'yt-uix-button-menu yt-uix-button-menu-external hid',
        id: "dsc-list-menu"
    }).appendTo('body'));
}


function addItemToList(data, videoUrl) {
    "use strict";
    var description = "", listElement, testFormat;
    if (formats[data.itag]) {
        description = formats[data.itag].description + ' (' + formats[data.itag].format + ')';
    } else {
        description = "Desconocido (" + data.itag + ")";
    }

    listElement  = jQuery('<a>', {
        href: videoUrl,
        text: description,
        'class': "yt-uix-button-menu-item"
    }).appendTo('#dsc-list-menu ul');

    testFormat = document.createElement('video');
    if (testFormat.canPlayType(data.type) !== "") {
        jQuery('<span>', {
            'class': "label",
            text: 'H5',
            title: 'Play in HTML5',
            css: {
                'position': 'absolute',
                'right': '0.6666em',
                'opacity': '0.6',
                'float': 'right'
            },
            click: function () {
                setHtml5Player(jQuery(this).parent().attr('href'));
                return false;
            }
        }).appendTo(listElement);
    }
}


(function () {
    "use strict";
    testJquery(function () {
        var video_id = getVideoId(location.href);
        if (video_id) {
            getVideoData(video_id, function (array_videoData) {
                createButtonUI();
                createDropDownMenuUI();
                var i, videoTitle, videoUrl;

                videoTitle = jQuery('#eow-title').attr('title');

                for (i = 0; i < array_videoData.length; i = i + 1) {
                    videoUrl = createVideoUrl(array_videoData[i], videoTitle);
                    addItemToList(array_videoData[i], videoUrl);
                }
            });
        }
    });
}());
