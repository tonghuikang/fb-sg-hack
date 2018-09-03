/* Copyright 2016 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. */
// TODO during integration: This will be called when a new post is detected.
// The search for new post is done every second.

function onClick() {
    if (inputsAreEmpty()) {
        label.textContent = 'Error: one or both inputs are empty.';
        inputs[0].value = "https://i.imgur.com/eHfuRCu.jpg";
        inputs[1].value = "Obama is born in Kenya.";
        return;
    }
    updateLabel();
}

function inputsAreEmpty() {
    if (getNumber1() === '' || getNumber2() === '') {
        return true;
    } else {
        return false;
    }
}

function updateLabel() {
    var image_url = getNumber1();
    var add_text = getNumber2();

    if (!image_url.match(/^[a-zA-Z]+:\/\//)) {
        image_url = 'https://' + image_url;
    }

    var displayedResult = image_url + '\n' + add_text;

    /////////////
    //// OCR ////
    /////////////
    // Using Google Vision API for OCR text extraction
    // Using TEXT_DETECTION instead of DOCUMENT_TEXT_DETECTION, no particular reason

    var xhr_ocr = new XMLHttpRequest();
    var data_ocr = {
        "requests": [{
            "features": [{
                "type": "TEXT_DETECTION"
            }],
            "image": {
                "source": {
                    "imageUri": "https://i.imgur.com/eHfuRCu.jpg"
                }
            }
        }]
    };
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
            var result_ocr = jsonParsed.responses[0].fullTextAnnotation.text;
            result_ocr = result_ocr.replace(/\n/g, " "); // replace newlines with space
            console.log(result_ocr);
            // I don't know how to line break within paragraph cell :/
            label.textContent = label.textContent + longDivider + " result_ocr : " + result_ocr;
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
                    label.textContent = label.textContent + longDivider + " result_keyword_noun (not used for the next step yet, haven't make use of the verbs also): " + nouns_string;

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
                            label.textContent = label.textContent + longDivider + " result_keyword_verb (not used for the next step yet, haven't make use of the verbs also): " + verbs_string;


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
                                    console.log("Google Custom Search results");
                                    console.log(jsonParsed);
                                    var fact_checks_list = [];
                                    for (var index in jsonParsed.items){
                                      var fact_check_title = jsonParsed.items[index].title;
                                      var fact_check_link = jsonParsed.items[index].link;
                                      console.log(fact_check_title);
                                      console.log(fact_check_link);
                                      fact_checks_list.push(fact_check_link + ':' + fact_check_title + ' --- ')
                                    }
                                    var fact_checks_string = fact_checks_list.join(' ')
                                    label.textContent = label.textContent + longDivider + " result_search : " + fact_checks_string;
                                };
                            }; // search
                        };
                    }; // keywords-verbs
                };
            }; // keywords-nouns
        };
    }; // OCR


    label.textContent = displayedResult;

}

function getNumber1() {
    return inputs[0].value;
}

function getNumber2() {
    return inputs[1].value;
}
var inputs = document.querySelectorAll('input');
var label = document.querySelector('p');
var button = document.querySelector('button');
var longDivider = ' --------------------------------------------------------------------------------------------------------------------------------------------- '
// because I don't know how to line break in <p> </p>
button.addEventListener('click', onClick);
