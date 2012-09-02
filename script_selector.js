(function () {
    'use strict';
    var url = '', host = location.hostname, sites, scriptElement;

	sites = {
        youtube: { url: "https://raw.github.com/spun/dsc/master/youtube/youtube.js" }
    };

    if (host === 'www.youtube.com' || host === 'youtube.com') {
        url = sites.youtube.url;
    }

    if (url !== '') {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute("src", url);
        document.body.appendChild(scriptElement);
    }
}());
