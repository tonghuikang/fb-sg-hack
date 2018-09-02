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
function onClick() {
  if (inputsAreEmpty()) {
    label.textContent = 'Error: one or both inputs are empty.';
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
  var addend1 = getNumber1();
  var addend2 = getNumber2();
  
  var searchString = addend2.replace(' ','+')
  
  
  var xhr1 = new XMLHttpRequest();
  var data = {
            "encodingType": "UTF8",
            "document": {
              "type": "PLAIN_TEXT",
              "content": "Kenya-born Obama is taking our guns away. Obama is pure evil."
                }
              };
  var body = JSON.stringify(data);
  
  xhr1.open("POST", 'https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E', true);
  xhr1.setRequestHeader('Content-Type', 'application/json');
  xhr1.send(body);
  xhr1.onreadystatechange = function() {
    if (xhr1.readyState === 4)  {
      serverResponse = xhr1.responseText;
      jsonParsed = JSON.parse(serverResponse);
      // okay I can now get any formatted result that I want from Google Custom Search
      // Now we need to extract the relevant search keywords, the next step is Google cloud language
      console.log(jsonParsed);
      // console.log(jsonParsed.items[0].formattedUrl);
    }
  }

  
  
  var xhr = new XMLHttpRequest();
  var serverResponse;
  var jsonParsed; 
  xhr.open("GET", 'https://www.googleapis.com/customsearch/v1?key=AIzaSyD6Csdss9VNdvqtu2rOJ0n19nZC6pHk-_E&cx=006556501642864997360:yq85mpbgvaq&q=' + searchString, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4)  {
      serverResponse = xhr.responseText;
      jsonParsed = JSON.parse(serverResponse);
      // okay I can now get any formatted result that I want from Google Custom Search
      // Now we need to extract the relevant search keywords, the next step is Google cloud language
      console.log(jsonParsed.items[0].formattedUrl);
      console.log(jsonParsed.items[0].formattedUrl);
    };
  };
  xhr.send(null);
  
  var sum = addend1 + addend2;
  label.textContent = addend1 + ' + ' + addend2 + ' = ' + sum + ' : ' + serverResponse;
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
