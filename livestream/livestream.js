/*global videojs: false, ActiveXObject: false */
/*jslint browser: true, regexp: true */

function getApiUrl() {
    'use strict';

    return window.lsconfig.event_design_eventId;
}

function getVideoUrls(apiUrl, callback) {
    'use strict';
    var listaVideos, xmlhttp,
        yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="' + apiUrl + '"') + '&format=json';

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            listaVideos = JSON.parse(xmlhttp.responseText).query.results.json.feed.data;
            callback(listaVideos);
        }
    };
    xmlhttp.open("GET", yql, true);
    xmlhttp.send();
}

function getVideoJs(callback) {
    'use strict';
    var script, link = document.createElement("link");
    link.href = "https://vjs.zencdn.net/4.1/video-js.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    script = document.createElement("script");
    script.src = "https://vjs.zencdn.net/4.1/video.js";
    script.onload = script.onreadystatechange = function () {
        callback();
    };
    document.body.appendChild(script);
}

function setHtml5Player(url, videoZone, postId) {
    'use strict';
    var video, source, dsc_video = document.getElementById('dsc_video-' + postId);

    if (dsc_video === null) {
        video = document.createElement('video');
        video.id = 'dsc_video-' + postId;
        video.setAttribute('class', 'video-js vjs-default-skin');
        video.setAttribute('width', '640');
        video.setAttribute('height', '360');

        while (videoZone.firstChild) {
            videoZone.removeChild(videoZone.firstChild);
        }
        videoZone.appendChild(video);

        source = document.createElement('source');
        source.type = 'video/mp4';
        source.src = url;
        video.appendChild(source);

        getVideoJs(function () {
            videojs('dsc_video-' + postId, {
                "controls": true,
                "autoplay": true,
                "preload": "auto"
            });
        });
    } else {
        source = document.getElementById('dsc_video-' + postId).childNodes[0];
        source.setAttribute('src', url);
    }
}

function addButton(buttonZone, text, link, videoZone, postId) {
    'use strict';
    var listElement = document.createElement('li'), elementLink = document.createElement('a');

    elementLink.setAttribute('class', 'feed_embed');
    elementLink.href = link;
    elementLink.textContent = text;

    listElement.appendChild(elementLink);
    buttonZone.insertBefore(listElement, buttonZone.childNodes[0]);

    elementLink.onclick = function (e) {
        e.preventDefault();
    };
    elementLink.ondblclick = function (e) {
        setHtml5Player(link, videoZone, postId);
        e.preventDefault();
    };
}

function setVideoPost(post, videoData) {
    'use strict';
    var buttonZone, replaceZone;

    buttonZone = post.getElementsByClassName('feed_share_embed')[0];
    replaceZone = post.getElementsByClassName('iframe-wrapper')[0];

    addButton(buttonZone, 'Video HD', videoData.progressive_url_hd, replaceZone, post.getElementsByClassName('post_content')[0].getAttribute('data-post_id'));
    addButton(buttonZone, 'Video SD', videoData.progressive_url, replaceZone, post.getElementsByClassName('post_content')[0].getAttribute('data-post_id'));
}

(function () {
    'use strict';
    var apiUrl = getApiUrl(), numPostsApi, posts, i, listadoApi = [];

    if (apiUrl) {
        getVideoUrls(apiUrl, function (resultApi) {

            if (resultApi[0]) {
                listadoApi = resultApi;
            } else {
                listadoApi.push(resultApi);
            }

            numPostsApi = listadoApi.length;
            posts = document.getElementsByClassName('post');

            if (numPostsApi === posts.length) {
                for (i = 0; i < numPostsApi; i = i + 1) {
                    if (listadoApi[i].type === 'video') {
                        setVideoPost(posts[i], listadoApi[i].data);
                    }
                }
            }
        });
    }
}());
