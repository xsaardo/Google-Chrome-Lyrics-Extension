var queryInfo = {
	audible : true,
}

var currLyrics;
var songTab;

// Get initial lyrics
chrome.tabs.query(queryInfo,function(tabInfo){
	var songInfo = tabInfo[0].title;
	songTab = tabInfo[0].id;
	//console.log(songTab);
	var currSongArtist = parseTabTitle(songInfo);
	fetchLyrics(currSongArtist[0],currSongArtist[1]);
	//document.getElementById("lyrics").innerHTML = "HDGJKLSD:";
});	

// Update lyrics when spotify tab title changes
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	if (tabId == songTab) {
		//console.log(changeInfo.title);
		var currSongArtist = parseTabTitle(changeInfo.title)
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
	//console.log("http://api.genius.com/search?q=" + song + " " + artist + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json")
	$.getJSON("http://api.genius.com/search?q=" + song + " " + artist + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa", function(json){
		try {
			// Get url of lyrics page
			var url = json.response.hits[0].result.url;
			//console.log(url);
			
			url = url.substring(18,url.length);
			//console.log(url);
			//url = url.slice(0,18) + "amp/" + url.slice(18);
			
			currLyrics = "";
			
			httpGet(url).then(function(htmlJSON){
				//console.log(htmlJSON);
				// Parse HTML JSON
				if ("a" in htmlJSON.htmlcode.query.results.body.div[2].p) {
					for (var i = 0; i < htmlJSON.htmlcode.query.results.body.div[2].p.a.length; i++) {
						//console.log(htmlJSON.htmlcode.query.results.body.div[2].p.a[i].content);
						currLyrics = currLyrics + '\n' + htmlJSON.htmlcode.query.results.body.div[2].p.a[i].content;
					}
				}
				
				//console.log(htmlJSON.htmlcode.query.results.body.div[2].p.content);
				currLyrics = currLyrics + '\n' + htmlJSON.htmlcode.query.results.body.div[2].p.content;
				
				if ("a" in htmlJSON.htmlcode.query.results.body.div[2]) {
					for (var i = 0; i < htmlJSON.htmlcode.query.results.body.div[2].a.length; i++) {
						//console.log(htmlJSON.htmlcode.query.results.body.div[2].a[i].content);
						currLyrics = currLyrics + '\n' + htmlJSON.htmlcode.query.results.body.div[2].a[i].content;
					}
				}
				
				//console.log(htmlJSON.htmlcode.query.results.body.div[2].content);
				currLyrics = currLyrics + '\n' + htmlJSON.htmlcode.query.results.body.div[2].content;
				
				currLyrics = currLyrics.replace(/\n\s*\n\s*\n/g, '\n\n');
				
				console.log(currLyrics);
				document.getElementById("lyrics").innerHTML = currLyrics
				//console.log(currLyrics);
				
				//console.log("HIIII" + currLyrics);
			});

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
	return $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%27http%3A%2F%2Fgenius.com%2Famp%2F" + theURL + "'&format=json").then(function(returnHTML) {
		return {htmlcode:returnHTML};
	});
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
