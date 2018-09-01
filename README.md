# Facebook Singapore Hackathon: Bad Memes

# Development Plan
Create a chrome extension that adds a label to the timestamp of every Facebook post. The site will be updated every second. Refer to ProjectFib for the possible implementation. A successful implementation means that the search can be done automatically, and the extension knows where to find the information for both the post and the image. Reference: https://github.com/tonghuikang/ProjectFib/blob/master/extension/myScript.js

Create a javascript function that takes in text input and a public image URL and returns the relevant fact check URL. We will be using Google APIs. Reference: https://github.com/tonghuikang/fb-sg-hack/blob/master/chrome/background.js

Put these two together and make them work. As the appending of HTML links are done automatically, it will be under `"content_scripts" : "js"` We will do this during the hackathon.

### User journey
The user scrolls through his Facebook feed. The contents of each post is being analysed on the background by the extension. After a few seconds, a hyperlink of the ClaimReview and its ClaimRating is displayed beside the timestamp. The user may click on the timestamp to read the fact check article on the fact-checking site, then comment on the argue against the post if necessary.

# The technical challenge
Given a facebook post, return the relevant fact check article's URL and its rating.

## Key algorithms
We use three Google Cloud API to achieve our objective.

#### Google Vision API
To extract the text present in the images

#### Google Natural Language API
To extract keywords, because the following step only allows 32 words in their query. 

#### Google Custom Search API
Taking the shortened text, it searches a list of reputable fact-checking sites. 

## Future technical improvements
In the recommendation of the most relevant claims, there is so much more to do. 

Implied context identification. Consider an image of the Prime Minister of Singapore Lee Hsien Loong and a picture caption alleging he squander billions of dollars of Singaporeans' retirement money. There is no mention of "Lee Hsien Loong" or "Prime Minister" anywhere in the Facebook post. There is a need to identify the individual before a meaningful text search can be done.

Reducing the reliance on Google API. Google APIs are great and make our prototype possible and easily scalable. However, in-house algorithms could be written to extract more relevant keywords rather than the list of entities and words that we are currently reading.



### Repository Resources
This repository is cloned from https://github.com/GoogleCloudPlatform/machine-learning-browser-extension

We will refer to Project FiB on how a Facebook post can be modified: https://github.com/anantdgoel/ProjectFib

We will also refer the other project Hui Kang is involved in for advice: https://github.com/tlkh/fake-news-chrome-extension


# Policy Considerations
Fake news is a tricky thing. It is ingrained in our bias to suggest posts that we do not agree with as fake news. 

The developed Claim Review schema helps to tackle this. While some fact check articles can be problematic and biased, we can declare at least a good majority of the claims as undefendable, and we should propagate this correction to as many people as possible.

Participation. There is a higher number of users who are keen to ensure the facts cited are factual, or at least use credible fact-checking articles to advance their arguments online. People who install our extension will be suggested the problem with the memes. Preferably we want people to suggest that news are fake, not just Facebook's algorithms.

We are aware that Facebook tried a similar initiative linking externally posted articles to mixed results. 
https://www.theverge.com/2017/12/21/16804912/facebook-disputed-flags-misinformation-newsfeed-fake-news
https://medium.com/facebook-design/designing-against-misinformation-e5846b3aa1e2
https://techcrunch.com/2018/04/27/facebook-false-news/ We focus on problematic memes which are based on false facts. 


Mention that our primary objective is to seek your advice here in Singapore, and hopefully at Facebook headquarters as well. 


# Technical Declarations
Tong Hui Kang has been involved in the Fake News problem since last October. The resulting project is a chrome extension that analyses an article on the publishers' website. In the project, Hui Kang explored using industrial natural language processing packages to detect whether a piece of text made any documented false claims. 

### Key differences
The object of analysis here is a Facebook post on Facebook, while the other project analyses articles on publishers' website e.g. The Straits Times. 

# Value proposition

### Convenience
Any user can clone this repo, install a Chrome Extension for themselves and experiment with the results. They only need to register for Google Cloud to get an API key that can be used for 100 custom search. It is possible to register this project as a non-profit 

### Privacy
We the creators of this extension will not have access to the posts you have accessed. However, please do be reminded that all of your activity on Facebook can be logged in Facebook, and all the pictures and text you analysed with Google API can be stored as well. 

### Flexibility
This extension is also easily modifiable for other sites where discussion exists, for instance, Reddit. Organisations can adopt our extension to help their possibly inexperienced volunteers to propagate their viewpoints hopefully with facts to achieve a more robust debate. 

False facts are only one of the fundamental disagreements between Internet communities. Partisans often make arguments that based on assumptions (for instance the gender wage gap, or that national service is necessary for Singapore) widely discredited by their opponents. There is a hindrance to a productive discussion if parties argue on different assumptions - and these assumptions are usually not facts that can be considered true or false. It is also debate participants to understand the strongest points by their opponents on their arguments. This extension can be modified under the same framework to tackle related problems.
