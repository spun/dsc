(window.webpackJsonp=window.webpackJsonp||[]).push([[3],[,function(e,t,n){"use strict";n.r(t);var o={5:{description:"LQ FLV",format:"FLV",extension:"flv"},6:{description:"LQ FLV",format:"FLV",extension:"flv"},13:{description:"LQ 3GP",format:"3GP",extension:"3gp"},17:{description:"LQ 3GP",format:"3GP",extension:"3gp"},18:{description:"LQ MP4",format:"MP4",extension:"mp4"},22:{description:"HD 720p MP4",format:"MP4",extension:"mp4"},34:{description:"LQ FLV",format:"FLV",extension:"flv"},35:{description:"HQ 480p FLV",format:"FLV",extension:"flv"},36:{description:"LQ 3GP",format:"3GP",extension:"3gp"},37:{description:"Full HD 1080 MP4",format:"MP4",extension:"mp4"},38:{description:"Original MP4",format:"MP4",extension:"mp4"},43:{description:"LQ WebM",format:"WebM",extension:"webm"},44:{description:"HQ 480p WebM",format:"WebM",extension:"webm"},45:{description:"HD 720p WebM",format:"WebM",extension:"webm"},46:{description:"Full HD 1080 WebM",format:"WebM",extension:"webm"},82:{description:"LQ MP4 (3D)",format:"MP4",extension:"mp4"},83:{description:"LQ MP4 (3D)",format:"MP4",extension:"mp4"},84:{description:"HD 720p MP4 (3D)",format:"MP4",extension:"mp4"},85:{description:"HQ 520p MP4 (3D)",format:"MP4",extension:"mp4"},100:{description:"LQ WebM (3D)",format:"WebM",extension:"webm"},101:{description:"LQ WebM (3D)",format:"WebM",extension:"webm"},102:{description:"HD 720p WebM (3D)",format:"WebM",extension:"webm"},133:{description:"*LQ 240p MP4",format:"MP4",extension:"mp4"},134:{description:"*MQ 360p MP4",format:"MP4",extension:"mp4"},135:{description:"*HQ 480p MP4",format:"MP4",extension:"mp4"},136:{description:"*HD 720p MP4",format:"MP4",extension:"mp4"},137:{description:"*Full HD 1080 MP4",format:"MP4",extension:"mp4"},138:{description:"*ULTRA HD 4K MP4",format:"MP4",extension:"mp4"},140:{description:"*AUDIO MP4",format:"MP4",extension:"m4a"},160:{description:"*LQ 144p WebM",format:"WebM",extension:"webm"},171:{description:"*AUDIO OGG",format:"OGG",extension:"ogg"},242:{description:"*LQ 240p WebM",format:"WebM",extension:"webm"},243:{description:"*MQ 360p WebM",format:"WebM",extension:"webm"},244:{description:"*HQ 480p WebM",format:"WebM",extension:"webm"},247:{description:"*HD 720p WebM",format:"WebM",extension:"webm"},248:{description:"*Full HD 1080 WebM",format:"WebM",extension:"webm"},264:{description:"*HD 1440p MP4",format:"MP4",extension:"mp4"},298:{description:"*HD 720p MP4 (60fps)",format:"MP4",extension:"mp4"},299:{description:"*Full HD 1080 (60fps)",format:"MP4",extension:"mp4"}};function i(e,t){var n;if(null===document.getElementById("dsc_video")){var o=document.createElement("video");o.id="dsc_video",o.setAttribute("class","video-js vjs-default-skin player-width player-height");for(var i=document.getElementById("player-api");i.firstChild;)i.removeChild(i.firstChild);document.getElementById("player-api").appendChild(o),o.setAttribute("width","auto"),o.setAttribute("height","auto"),(n=document.createElement("source")).src=e,n.type=t,o.appendChild(n),function(e){var t=document.createElement("link");t.href="https://vjs.zencdn.net/4.10.1/video-js.css",t.rel="stylesheet",document.head.appendChild(t);var n=document.createElement("script");n.src="https://vjs.zencdn.net/4.10.1/video.js",n.onreadystatechange=function(){e()},n.onload=n.onreadystatechange,document.body.appendChild(n)}(function(){videojs("dsc_video",{controls:!0,autoplay:!0,preload:"auto"})}),o.onerror=function(){var e,t=o.currentTime;e=function(){o.currentTime=t,o.removeEventListener("canplay",e)},o.addEventListener("canplay",e),o.play()}}else(n=document.getElementById("dsc_video").childNodes[0]).setAttribute("src",e),n.setAttribute("type",t)}function r(e,t,n){var r="",s="";r=o[e.itag]?"".concat(o[e.itag].description," (").concat(o[e.itag].format,")"):"Unknown (".concat(e.itag,")");var a=document.createElement("a");a.href=t,a.textContent=r,a.setAttribute("class","yt-uix-button-menu-item"),n&&(o[e.itag]&&(s="".concat(n,".").concat(o[e.itag].extension)),a.setAttribute("download",s)),document.getElementById("dsc-list-menu").childNodes[0].appendChild(a);var d=document.createElement("video"),c=e.type.split(";")[0];if(""!==d.canPlayType(c)){var p=document.createElement("span");p.setAttribute("class","label"),p.textContent="H5",p.title="Play in HTML5",p.setAttribute("videoType",c),p.style.position="absolute",p.style.right="0.6666em",p.style.opacity="0.6",p.style.position="float",p.onclick=function(){return i(p.parentNode.href,p.getAttribute("videoType")),!1},a.appendChild(p),a.style.paddingRight="30px"}}t.default=function(){!function(){var e=document.getElementById("dsc-button");null!==e&&e.parentNode.removeChild(e);var t=document.createElement("span");t.setAttribute("class","yt-uix-button-content"),t.textContent="Descargar";var n=document.createElement("button");n.setAttribute("class","yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup action-panel-trigger action-panel-trigger-overflow yt-uix-tooltip"),n.type="button",n.onclick=";return false;",n.setAttribute("role","button"),n.id="dsc-button",n.setAttribute("aria-haspopup","true"),n.setAttribute("aria-label","Menú descarga"),n.setAttribute("aria-pressed","false"),n.setAttribute("data-tooltip-text","Descargar"),n.title="Descarga el video",n.setAttribute("data-button-menu-id","dsc-list-menu"),n.appendChild(t);var o=document.createElement("div");o.setAttribute("class","yt-uix-menu"),o.appendChild(n);var i=document.getElementById("watch8-secondary-actions"),r=i.firstChild;i.insertBefore(o,r)}(),function(){var e=document.getElementById("dsc-list-menu");null!==e&&e.parentNode.removeChild(e);var t=document.createElement("ul");t.setAttribute("class","flag-menu");var n=document.createElement("div");n.setAttribute("class","yt-uix-button-menu yt-uix-button-menu-external hid"),n.id="dsc-list-menu",n.appendChild(t),document.body.appendChild(n)}();var e,t,n,o,i=[],s=ytplayer.config.args.url_encoded_fmt_stream_map.split(","),a={};for(e=0;e<s.length;e+=1){for(a={},n=s[e].split("&"),t=0;t<n.length;t+=1)o=n[t].split("="),a[decodeURIComponent(o[0])]=decodeURIComponent(o.slice(1).join("="));i.push(a)}var d,c,p=escape(ytplayer.config.args.title.replace(/"/g,""));for(e=0;e<i.length;e+=1)d="".concat(decodeURIComponent("".concat(i[e].url,"&signature=").concat(i[e].sig)),"&title=").concat(p),r(i[e],d);(c=document.createElement("li")).setAttribute("class","yt-uix-button-menu-new-section-separator"),document.getElementById("dsc-list-menu").childNodes[0].appendChild(c);var l=ytplayer.config.args.adaptive_fmts.split(",");for(e=0;e<l.length;e+=1){for(a={},n=l[e].split("&"),t=0;t<n.length;t+=1)o=n[t].split("="),a[decodeURIComponent(o[0])]=decodeURIComponent(o.slice(1).join("="));r(a,a.url,decodeURIComponent(p))}}}]]);