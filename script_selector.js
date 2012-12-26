(function () {
    'use strict';
    var url = '',
        host = location.hostname,
        sites = {},
        scriptElement;

    sites = {
        youtube: {
            url: 'https://raw.github.com/spun/dsc/master/youtube/youtube.js'
        },
        goear: {
            url: 'https://raw.github.com/spun/dsc/master/goear/goear.js'
        }
    };

    if (host === 'www.youtube.com' || host === 'youtube.com') {
        url = sites.youtube.url;
    } else if (host === 'www.goear.com' || host === 'goear.com') {
        url = sites.goear.url;
    }

    if (url !== '') {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute("src", url);
        document.body.appendChild(scriptElement);
    }
}());
