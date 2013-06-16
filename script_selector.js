(function () {
    'use strict';
    var url = '',
        host = location.hostname,
        domain = document.domain,
        sites = {},
        scriptElement;

    sites = {
        youtube: {
            url: 'https://raw.github.com/spun/dsc/master/youtube/youtube.js'
        },
        goear: {
            url: 'https://raw.github.com/spun/dsc/master/goear/goear.js'
        },
        twitch: {
            url: 'https://raw.github.com/spun/dsc/master/twitch/twitch.js'
        },
        detector: {
            url: 'https://c9.io/spun/dsc/workspace/detector.js'
        }
    };

    if (host === 'www.youtube.com' || host === 'youtube.com') {
        url = sites.youtube.url;
    } else if (host === 'www.goear.com' || host === 'goear.com') {
        url = sites.goear.url;
    } else if (domain === 'twitch.tv') {
        url = sites.twitch.url;
    } else {
        url = sites.detector.url;
    }

    if (url !== '') {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute("src", url);
        document.body.appendChild(scriptElement);
    }
}());
