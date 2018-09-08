var picture_lib = ["_2a2q _65sr", "_5cq3 _1ktf", "_1ktf", "_6ks"];

var add_link = function(source, _link, description){
	var time_position = source.getElementsByClassName("_5pcp _5lel _2jyu _232_");
	var newlink = document.createElement("a");
	newlink.setAttribute("herf", _link);
	newlink.innerHTML = description;
	time_position[0].appendChild(newlink);
}


var find_text = function(source, class_name){
	var output = "";
	var text_positions = source.getElementsByClassName(class_name);
	for (var j=0, len=text_positions.length; j<len; j++){
		output += text_positions[j].textContent; 
	}
	console.log(output);
	return output
}

var add_checkbox = function(source){
	var time_position = source.getElementsByClassName("_5pcp _5lel _2jyu _232_");
	var checkbox_positive = document.createElement("input");
	checkbox_positive.type = "checkbox";
	checkbox_positive.name = "positive_box";
	
	var checkbox_negative = document.createElement("input");
	checkbox_negative.type = "checkbox";
	checkbox_negative.name = "negative_box";
	
	var label = document.createElement("label");
	label.appendChild(document.createTextNode("Is the article relevant?"));
	var label_yes = document.createElement("label");
	label_yes.appendChild(document.createTextNode("YES"));
	var label_no = document.createElement("label");
	label_no.appendChild(document.createTextNode("No?"));
	
	time_position[0].appendChild(label);
	time_position[0].appendChild(checkbox_positive);
	time_position[0].appendChild(label_yes);
	time_position[0].appendChild(checkbox_negative);
	time_position[0].appendChild(label_no);
	
	checkbox_positive.addEventListener("change", function(){
		if (this.checked){
			console.log("positive");
		}
	})
	checkbox_negative.addEventListener("change", function(){
		if (this.checked){
			console.log("negative")
		}
	})
}



var b64 = function (url, cb) {
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      canvas.getContext('2d').drawImage(this, 0, 0);
      var b64data = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
      cb(b64data);
    };
    image.src = url;
  };



var fact_checker = function(location, image_url, add_text) {

    if (!image_url.match(/^[a-zA-Z]+:\/\//)) {
        image_url = 'https://' + image_url;
    }

    var displayedResult = image_url + '\n' + add_text;
    var data_ocr = {};

    /////////////
    //// OCR ////
    /////////////
    // Using Google Vision API for OCR text extraction
    // Using TEXT_DETECTION instead of DOCUMENT_TEXT_DETECTION, no particular reason

    var xhr_ocr = new XMLHttpRequest();

    b64(image_url, function (b64data) {
        var data = {
            "requests": [{
              "image": {"content": b64data},
              "features": [{'type': 'TEXT_DETECTION'}]
            }]
          };
        data_ocr = data;

    console.log(data_ocr);

    var body_ocr = JSON.stringify(data_ocr);
    xhr_ocr.open("POST", 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
    xhr_ocr.setRequestHeader('Content-Type', 'application/json');
    xhr_ocr.send(body_ocr);
    xhr_ocr.onreadystatechange = function() {
        if (xhr_ocr.readyState === 4) {
            var serverResponse = xhr_ocr.responseText;
            var jsonParsed = JSON.parse(serverResponse);
            // okay I can now get any formatted result that I want from Google Custom Search
            // Now we need to extract the relevant search keywords, the next step is Google cloud language
            console.log("Google Vision API - OCR results");
            console.log(jsonParsed);
            if (jsonParsed.responses[0].hasOwnProperty('fullTextAnnotation')){
                var result_ocr = jsonParsed.responses[0].fullTextAnnotation.text;
            } else {
                var result_ocr = '';
            }
            // BUG - SPOILS WHEN THE IMAGES DOES NOT CONTAIN ANY TEXT.
            result_ocr = result_ocr.replace(/\n/g, " "); // replace newlines with space
            console.log(result_ocr);
            // I don't know how to line break within paragraph cell :/
            // label.textContent = label.textContent + longDivider + " result_ocr : " + result_ocr;
            var text_to_parse = add_text + ' ' + result_ocr;

            ///////////////////////
            //// KEYWORD-NOUNS ////
            ///////////////////////
            // Using Google Natural Language API for entity sentiment anaysis
            // (why 'entity sentiment' - it captures words like 'evil' unlike 'entity' only)
            // -- TODO later: we want verb extraction (syntax) to be run concurrently
            // Future work: search the Claim Review directly - given-text-detect-claim

            var xhr_keyword_n = new XMLHttpRequest();
            var data_keyword_n = {
                "encodingType": "UTF8",
                "document": {
                    "type": "PLAIN_TEXT",
                    "content": text_to_parse
                }
            };
            var body_keyword_n = JSON.stringify(data_keyword_n);
            xhr_keyword_n.open("POST", 'https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
            xhr_keyword_n.setRequestHeader('Content-Type', 'application/json');
            xhr_keyword_n.send(body_keyword_n);
            console.log("Running Google Natural Language API on for entity sentiment: " + text_to_parse)
            xhr_keyword_n.onreadystatechange = function() {
                if (xhr_keyword_n.readyState === 4) {
                    var serverResponse = xhr_keyword_n.responseText;
                    var jsonParsed = JSON.parse(serverResponse);
                    // okay I can now get any formatted result that I want from Google Custom Search
                    // Now we need to extract the relevant search keywords, the next step is Google cloud language
                    console.log("Google Natural Language API - entity sentiment results");
                    console.log(jsonParsed);
                    var noun_list = [];
                    for (var index in jsonParsed.entities) {
                        noun_list.push(jsonParsed.entities[index].name);
                    }
                    var nouns_string = noun_list.join(' ');
                    console.log(nouns_string);
                    // label.textContent = label.textContent + longDivider + " result_keyword_noun (not used for the next step yet, haven't make use of the verbs also): " + nouns_string;

                    ///////////////////////
                    //// KEYWORD-VERBS ////
                    ///////////////////////
                    // Extraction of verbs with Google Natural Langauge API - Syntax

                    var xhr_keyword_v = new XMLHttpRequest();
                    var data_keyword_v = {
                        "encodingType": "UTF8",
                        "document": {
                            "type": "PLAIN_TEXT",
                            "content": text_to_parse
                        }
                    };
                    var body_keyword_v = JSON.stringify(data_keyword_v);
                    xhr_keyword_v.open("POST", 'https://language.googleapis.com/v1/documents:analyzeSyntax?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
                    xhr_keyword_v.setRequestHeader('Content-Type', 'application/json');
                    xhr_keyword_v.send(body_keyword_v);
                    console.log("Running Google Natural Language API for syntax analysis: " + text_to_parse)
                    xhr_keyword_v.onreadystatechange = function() {
                        if (xhr_keyword_v.readyState === 4) {
                            var serverResponse = xhr_keyword_v.responseText;
                            var jsonParsed = JSON.parse(serverResponse);
                            // okay I can now get any formatted result that I want from Google Custom Search
                            // Now we need to extract the relevant search keywords, the next step is Google cloud language
                            console.log("Google Natural Language API - syntax results");
                            console.log(jsonParsed);


                            var root_verbs = [];
                            for (var index in jsonParsed.tokens) {
                                // console.log(jsonParsed.tokens[index]);
                                if (jsonParsed.tokens[index].dependencyEdge.label == 'ROOT') {
                                    var word_in_context = jsonParsed.tokens[index].text.content;
                                    console.log(jsonParsed.tokens[index].text.content);
                                    root_verbs.push(word_in_context);
                                }
                            }
                            var verbs_string = root_verbs.join(' ');
                            // label.textContent = label.textContent + longDivider + " result_keyword_verb (not used for the next step yet, haven't make use of the verbs also): " + verbs_string;


                            ////////////////
                            //// SEARCH ////
                            ////////////////
                            // Using Google Custom Search API to search certain fact-checking sites
                            // The top three results will be shown beside the timestamp

                            var text_to_search = nouns_string + ' ' + verbs_string;
                            var xhr_search = new XMLHttpRequest();
                            xhr_search.open("GET", 'https://www.googleapis.com/customsearch/v1?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E&cx=006556501642864997360:yq85mpbgvaq&q=' + text_to_search, true);
                            xhr_search.send(null);
                            console.log("Running Google Custom Search API to search fact-check articles : " + text_to_search)
                            xhr_search.onreadystatechange = function() {
                                if (xhr_search.readyState === 4) {
                                    var serverResponse = xhr_search.responseText;
                                    var jsonParsed = JSON.parse(serverResponse);
                                    // okay I can now get any formatted result that I want from Google Custom Search
                                    // Now we need to extract the relevant search keywords, the next step is Google cloud language
                                    // BUG: If no entity or verbs are being detected nothing will be searched.
                                    console.log("Google Custom Search results");
                                    console.log(jsonParsed);
                                    var fact_checks_list = [];
                                    for (var index in jsonParsed.items){
                                    var fact_check_title = jsonParsed.items[index].title;
                                    var fact_check_link = jsonParsed.items[index].link;
                                    console.log(fact_check_title);
                                    console.log(fact_check_link);
                                    fact_checks_list.push(fact_check_link + ':' + fact_check_title + ' --- ');
                                    add_link(location, fact_check_link, fact_check_title);
                                    }
                                    var fact_checks_string = fact_checks_list.join(' ');
                                    // label.textContent = label.textContent + longDivider + " result_search : " + fact_checks_string;
                                };
                            }; // search
                        };
                    }; // keywords-verbs
                };
            }; // keywords-nouns
        };
    }; // OCR

    }); // b64 image loading

    // label.textContent = displayedResult;

}




var find_img = function(source){
	var srclist = [];
	var imgs = [];
	for (var k=0; k<picture_lib.length; k++){
		var prob_imgs = source.getElementsByClassName(picture_lib[k]);
		if (!prob_imgs.length==0){
			imgs = prob_imgs;
		}
	}
	if (!imgs.length==0){
		var pictures = imgs[0].getElementsByTagName("img");
		for (var j=0; j<imgs.length; j++){
			srclist.push(pictures[j].src);
		}
		console.log(srclist[0]);
		return srclist[0]
	}else{
		console.log("https://i.imgur.com/hwOrFan.png")
		return "https://i.imgur.com/hwOrFan.png"
	}
	
}
var find_video = function(source){
	var srclist = [];
	var pictures = source[0].getElementsByTagName("img");
	for (var l=0; l<pictures.length; l++){
		srclist.push(pictures[l].src);
	}
	return srclist[0]
}
var posts = new Set();
var find_post = function(){
	var new_posts = document.getElementsByClassName("_4-u2 mbm _4mrt _5jmm _5pat _5v3q _4-u8");
	for (var i=0; i<new_posts.length; i++){
		var a_post = new_posts[i];
		if (!posts.has(a_post)){
			posts.add(a_post);
			
			var mains = a_post.getElementsByClassName("_1dwg _1w_m _q7o");
			var post = mains[0];
			var is_video = post.getElementsByClassName("_150c");

			
			var shared = post.getElementsByClassName("mtm _5pcm");
			if (!shared.length==0){
				var description_text = find_text(post, "mtm _5pco")
				if (is_video.length==0){
					var photo = find_img(post);
				}else{
					var photo = find_video(is_video);
				}

				fact_checker(shared[0], photo, description_text);
				add_checkbox(shared[0]);
			}
			
			
			
			var multiple_shared = post.getElementsByClassName("_5ya");
						
			
			
			if (shared.length==0 && multiple_shared.length==0){
				var description_text = find_text(post, "_5pbx userContent _3576");
				if (is_video.length==0){
					var photo = find_img(post);					
				}else{
					var photo = find_video(is_video);
				}
				fact_checker(post, photo, description_text);
				add_checkbox(post);
			}
		}
	}
}

setInterval(find_post, 1000);