function testJquery(callback) {
	if ( typeof jQuery == 'undefined' )
	{
		var script = document.createElement("script");
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js";
		script.onload = script.onreadystatechange = function(){ callback() };
		document.body.appendChild( script );
	}
	else 
	{
		callback();
	}	
}


function getVideoId(locationUrl) {
	var a = document.createElement('a');
	a.href = locationUrl;
	var host = a.hostname;
	
	if (host.substr(host.length - 11) == "youtube.com" && host != "m.youtube.com")
	{
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
		var match = locationUrl.match(regExp);
		if (match&&match[2].length==11)
		{
			return match[2];
		}
	}	
	return false;	
}


function getVideoData(videoId, callback) {
	$.ajax({
		url: 'http://www.youtube.com/get_video_info?&video_id='+videoId,
		success: function(response) {
		
			var decode_response = decodeURIComponent(decodeURIComponent(decodeURIComponent(response)));
			var array_urls = decode_response.split(/[=,]url=/);
			var num_urls = array_urls.length; 
			var video_datas = [];
			
			for (var i=1; i<num_urls; i++)
			{		
				var data = {};
				var url_data = array_urls[i].split(/\?(.+)/);
				data['url'] = url_data[0];
				
				if(url_data[1])
				{
					var param_string = url_data[1];
					if(param_string[param_string.length-1] == ',')	
						param_string = param_string.substring(0, param_string.length - 1)
					
					var parameters = param_string.split(/&|;\++/);				
					
					for (j in parameters)
					{						
						var ab = parameters[j].split('=');
						// Ignore itag redundancy
						if(!(ab.length > 2 && ab[ab.length-1] != ""))
						{
							data[ab[0]] = ab[1];
						}
					}					
					video_datas.push(data);
				}			
			}
			callback(video_datas);
		}
	});
}


function createVideoUrl(videoObject, videoTitle) {
	var url = videoObject["url"] + "?";
	url += "sparams=" + videoObject["sparams"];
	var sparams = videoObject["sparams"].split(',');

	for(var param in sparams)
	{
		url += "&"+sparams[param]+"=" + videoObject[sparams[param]];
	}

	url += "&signature=" + videoObject["signature"];
	url += "&mv=" + videoObject["mv"];
	url += "&sver=" + videoObject["sver"];
	url += "&mt=" + videoObject["mt"];
	url += "&key=" + videoObject["key"];
	
	url += "&title=" + videoTitle;
	
	return url;
}


function createButtonUI() {

	$('<img/>', {
		class: 'yt-uix-button-arrow',
		src: '//s.ytimg.com/yt/img/pixel-vfl73.gif',
		alt: ''		
	}).appendTo($('<button>', {
		type: 'button',
		id: "dsc-button",
		onclick: ";return false;",
		class: 'yt-uix-tooltip-reverse yt-uix-button yt-uix-button-default yt-uix-tooltip',
		title: 'Descarga el video',
		html: '<span class="yt-uix-button-content">Descargar </span>',
		"data-button-menu-id": "dsc-list-menu",
		role: "button",
		"aria-pressed": "false",
		"aria-expanded": "false",
		type: "button"
	}).appendTo('#watch-actions'));	
}


function createDropDownMenuUI() {
	var list = $('<ul>', {
		class: 'flag-menu'
	}).appendTo($('<div>', {
		class: 'yt-uix-button-menu yt-uix-button-menu-external'	,
		style: 'min-width: 153px; left: 541px; top: 564.5px; ',
		id: "dsc-list-menu",
		style: {
			display: "none"
		}		
	}).appendTo('body'));
}


function addItemToList(data, videoUrl) {
	var description = "";
	if(formats[data.itag])
		description = formats[data.itag].description+' ('+formats[data.itag].format+')';
	else
		description ="Desconocido ("+data.itag+")";

	$('<span>', {
		class: "label",
		text: description,
	}).appendTo($('<a>', {
		href: videoUrl,	
		class: "yt-uix-button-menu-item"						
	}).appendTo('#dsc-list-menu ul'));
}


(function() {

	testJquery(function() {
		var video_id = getVideoId(location.href);
		if(video_id) {
			getVideoData(video_id, function(array_videoData) {
				createButtonUI();
				createDropDownMenuUI();
				var videoTitle = array_videoData[array_videoData.length-1].title;

				for(var i in array_videoData)
				{
					var videoUrl = createVideoUrl(array_videoData[i], videoTitle);
					addItemToList(array_videoData[i], videoUrl)
				}
			});		
		}	
	});	
})();


var formats = {
	5:  {description: "LQ FLV"			 , format: "FLV" },
	18: {description: "LQ MP4"			 , format: "MP4" },
	22: {description: "HD 720p MP4" 	 , format: "MP4" },
	34: {description: "LQ FLV"			 , format: "FLV" },
	35: {description: "HQ 480p FLV" 	 , format: "FLV" },
	37: {description: "Full HD 1080 MP4" , format: "MP4" },
	38: {description: "Original MP4"	 , format: "MP4" },
	43: {description: "LQ WebM"			 , format: "WebM"},
	44: {description: "HQ 480p WebM"	 , format: "WebM"},
	45: {description: "HD 720p WebM"	 , format: "WebM"},
	46: {description: "Full HD 1080 WebM", format: "WebM"},
};