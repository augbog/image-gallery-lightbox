# Lightbox Demo
Just a basic lightbox image gallery demo I made using Google Search API

See demo here: https://image-gallery-challenge.herokuapp.com/

## Running locally
1. `cd` into this project and then do an `npm install` and also make sure you are running on Node version 5.0.0 (I have added a .nvmrc file if you use `nvm`)
2. Once all packages are installed you can build by doing `gulp sass scripts`
3. You may use the api key I provide you if you wish to test locally but please be aware we are limited to 100 requests per day so you may need to regenerate an API key if you wish to keep running locally.

## config.json
I purposely added my API credentials so you can test but normally I would NOT do this and I would keep the API key out of version control. The API key I have committed for your sake is what I am using on my Heroku server so naturally whatever you use it up here, will use up there. The format of the config.json is

```
{
  "searchEngineId" : "",
  "apiKey" : "",
  "urlSearch" : "https://www.googleapis.com/customsearch/v1?q={QUERY}&cx={SEARCH_ENGINE_ID}&searchType=image&start={START_INDEX}&key={YOUR_API_KEY}"
}
```

Ideally this request is made server-side so people do not get access to our api key. Play around with the [Custom Search API with the API Explorer](https://developers.google.com/apis-explorer/?hl=en_US#p/customsearch/v1/). For more information on what they expect, you can go [here](https://developers.google.com/custom-search/json-api/v1/reference/cse/list#parameters).

Please also note... if you see 403 errors, it is because the Free tier only allows up to 100 requests per day. I did some basic error handling to handle this case.

If you need to regenerate or make new API keys, you can go [here](https://console.developers.google.com). You should not have to touch `searchEngineId` or the `urlSearch` as those as constant values I provide.

If you are curious, my search engine I have customized simply pulls images from reddit and imgur link patterns.

