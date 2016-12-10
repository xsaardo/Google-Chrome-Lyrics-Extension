console.log("hi");

var queryInfo = {
	audible : true,
}

var currLyrics;
var songTab;

// Get initial lyrics
chrome.tabs.query(queryInfo,function(tabInfo){
	var songInfo = tabInfo[0].title;
	songTab = tabInfo[0].id;
	console.log("Original: " + songTab);
	var currSongArtist = parseTabTitle(songInfo);
	document.getElementById("title").innerHTML = currSongArtist[0] + " - " + currSongArtist[1] + " - Lyrics";
	fetchLyrics(currSongArtist[0],currSongArtist[1]);
	//document.getElementById("lyrics").innerHTML = "HDGJKLSD:";
});	

// Update lyrics when spotify tab title changes
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	console.log("New tab: " + tabId);
	if (tabId == songTab && tab.audible == true) {
		console.log(changeInfo);
		var currSongArtist = parseTabTitle(changeInfo.title)
		document.getElementById("title").innerHTML = currSongArtist[0] + " - " + currSongArtist[1] + " - Lyrics";
		fetchLyrics(currSongArtist[0],currSongArtist[1]);
	}
})

// Split tab title into array of [song, artist];
function parseTabTitle(tabTitle) {
	//console.log("Parsing title" + tabTitle);
	tabTitle = tabTitle.substring(2, tabTitle.length);
	//console.log(tabTitle);
	tabTitle = tabTitle.split("-");
	//tabTitle = tabTitle.splice(0,1);
	//console.log(tabTitle[tabTitle.length-2]);
	//console.log(tabTitle[tabTitle.length-3]);
	return [tabTitle[tabTitle.length-2], tabTitle[tabTitle.length-3]];
	
}

// Fetch lyrics from genius API
function fetchLyrics(song,artist) {

	$.getJSON("http://api.genius.com/search?q=" + song + " " + artist + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa", function(json){
		try {
			// Get url of lyrics page
			var url = json.response.hits[0].result.url;
			//console.log(url);
			
			//console.log(url);
			url = url.slice(0,18) + "amp/" + url.slice(18);
			
			currLyrics = "";
			
			httpGet(url);
		}
		catch(err) {
			console.log(err);
			console.log("Lyrics not found")
			currLyrics = 'Lyrics not found on Genius';
			return currLyrics;
		}
	})
	.done(function() {
		console.log('Genius search done')
	})
	.fail(function() {
		alert('Failed Genius search request')
	});
}

// Get the html code for a URL
function httpGet(theURL) { 
	var xmlhttp = new XMLHttpRequest();
	var htmlcode;
	
	// Function to execute upon state change
    xmlhttp.onreadystatechange=function()
    {
		// Function to execute upon successful http request
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
			console.log("HTTP request successful");
			// Get html for lyrics page
			htmlcode = xmlhttp.responseText;
			
			// Isolate lyrics div of html
			htmlcode = htmlcode.substring(htmlcode.search('<div class="lyrics">'));
			htmlcode = htmlcode.substring(21,htmlcode.search("</p>"));
			
			// Strip html tags
			htmlcode = htmlcode.replace(/<(?:.|\n)*?>/gm, ''); 
			
			// Add extra <br> between [segments] for clarity
			var indices = findAllSubstringInd(htmlcode,"[");
			for (var index in indices) { 
				htmlcode = htmlcode.slice(0,indices[index]+index*4) + '<br>' + htmlcode.slice(indices[index]+index*4);
			}
			
			currLyrics = htmlcode;
			console.log(currLyrics);
			document.getElementById("lyrics").innerHTML = currLyrics;
		}
	}
	
	// Send http request
	console.log("HTTP request sent")
    xmlhttp.open("GET", theURL, true);
    xmlhttp.send();
}

// Helper function: Find all indices of substring in string
function findAllSubstringInd(str, substring) {
	var indices = new Array();
	var j = 0;
	var i = 1;
	while (i > 0) {
		i = str.indexOf(substring,i);
		indices[j] = i;
		i = i+1;
		j++;
	}
	indices.pop();
	return indices;
}
