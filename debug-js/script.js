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
// TODO next: pipe these three API, since you need to ocr then keyword then search
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
  
  if (!image_url.match(/^[a-zA-Z]+:\/\//)){
    image_url = 'https://' + image_url;
  }
  
  var searchString = add_text;
  var displayedResult = image_url + '\n' + searchString;
  
  // Using Google Vision API for OCR text extraction
  // Using TEXT_DETECTION instead of DOCUMENT_TEXT_DETECTION, no particular reason
  
  var xhr_ocr = new XMLHttpRequest();
  var data_ocr = {
    "requests": [
      {
        "features": [
          {
            "type": "TEXT_DETECTION"
          }
        ],
        "image": {
          "source": {
            "imageUri": "https://i.imgur.com/eHfuRCu.jpg"
          }
        }
      }
    ]
  };
  var body_ocr = JSON.stringify(data_ocr);  
  xhr_ocr.open("POST", 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
  xhr_ocr.setRequestHeader('Content-Type', 'application/json');
  xhr_ocr.send(body_ocr);
  xhr_ocr.onreadystatechange = function() {
    if (xhr_ocr.readyState === 4)  {
      var serverResponse = xhr_ocr.responseText;
      var jsonParsed = JSON.parse(serverResponse);
      // okay I can now get any formatted result that I want from Google Custom Search
      // Now we need to extract the relevant search keywords, the next step is Google cloud language
      console.log("Google Vision API - OCR results");
      console.log(jsonParsed);
      var result_ocr = jsonParsed.responses[0].fullTextAnnotation.text;
      result_ocr = result_ocr.replace(/\n/g, " ");  // replace newlines with space
      console.log(result_ocr);
      searchString += result_ocr;
      // I don't know how to line break within paragraph cell :/
      label.textContent = label.textContent + " --------------------------------------------------------------- result_ocr : " + result_ocr;
      // console.log(jsonParsed.items[0].formattedUrl);
    
    
    // Using Google Natural Language API for entity sentiment anaysis
    // (why 'entity sentiment' - it captures words like 'evil' unlike 'entity' only)
    // TODO next: extract the verb as well, entity-sentiment after syntax for now
    // Then combine them into the result that is to be passed into 
    // -- TODO later: we want verb extraction (syntax) to be run concurrently
    // Future work: search the Claim Review directly - given-text-detect-claim

    var xhr_keyword = new XMLHttpRequest();
    var data_keyword = {
      "encodingType": "UTF8",
      "document": {
        "type": "PLAIN_TEXT",
        "content": searchString
      }
    };
    var body_keyword = JSON.stringify(data_keyword);
    xhr_keyword.open("POST", 'https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
    xhr_keyword.setRequestHeader('Content-Type', 'application/json');
    xhr_keyword.send(body_keyword);
    xhr_keyword.onreadystatechange = function() {
      if (xhr_keyword.readyState === 4)  {
        var serverResponse = xhr_keyword.responseText;
        var jsonParsed = JSON.parse(serverResponse);
        // okay I can now get any formatted result that I want from Google Custom Search
        // Now we need to extract the relevant search keywords, the next step is Google cloud language
        console.log("Google Natural Language API - entity sentiment results");
        console.log(jsonParsed);
        var result_keyword = jsonParsed.entities[0].name;  // WILL ITERATE AND GET ALL THE NAMES
        console.log(result_keyword);
        // I don't know how to line break within paragraph cell :/
        label.textContent = label.textContent + " --------------------------------------------------------------- result_keyword : " + result_keyword;
      
    
    // Using Google Custom Search API to search certain fact-checking sites
    // The top three results will be shown beside the timestamp

    var xhr_search = new XMLHttpRequest();
    xhr_search.open("GET", 'https://www.googleapis.com/customsearch/v1?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E&cx=006556501642864997360:yq85mpbgvaq&q=' + searchString, true);
    xhr_search.send(null);
    xhr_search.onreadystatechange = function() {
      if (xhr_search.readyState === 4)  {
        var serverResponse = xhr_search.responseText;
        var jsonParsed = JSON.parse(serverResponse);
        // okay I can now get any formatted result that I want from Google Custom Search
        // Now we need to extract the relevant search keywords, the next step is Google cloud language
        console.log("Google Custom Search results");
        console.log(jsonParsed);
        var result_search = jsonParsed.items[0].formattedUrl;  
        console.log(result_search);
        // I don't know how to line break within paragraph cell :/
        label.textContent = label.textContent + " --------------------------------------------------------------- result_search : " + result_search;
      };
    }; // search
      };}; // keywords
    };}; // OCR
  
  
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
button.addEventListener('click', onClick);
