(function() {
  var CONFIG = require('./../config.json');
  var debounce = require('./modules/debounce');
  var DEBOUNCE_INTERVAL = 500;

  var searchInput = document.getElementById('search');
  var searchInputContainer = searchInput.parentNode;
  var nextButton = document.getElementById('next-button');
  var prevButton = document.getElementById('previous-button');
  var closeButton = document.getElementById('close-button');
  var searchResults = document.getElementById('search-results');
  var currentImage = document.getElementById('current-image');
  var currentImageTitle = document.getElementById('current-image-title');

  searchInput.onchange = debounce(function(e) {
    clearResults();
    showLoading();
    getSearchResults(searchInput.value, 3);
  }, DEBOUNCE_INTERVAL);

  // delegate events to all img children of the imageGalleryContainer
  // since we need handle dynamic images as well
  // Totally plagiarized from http://javascript.info/tutorial/event-delegation
  searchResults.addEventListener('click', function(e) {
    var event = e || window.event;
    var target = event.target || event.srcElement;

    while (target != searchResults) {
      if (target.nodeName == 'IMG') {
        showLightBox(target);
      }
      target = target.parentNode;
    }
  }, false);

  nextButton.addEventListener('click', function(e) {
    var targetIndex = parseInt(e.target.getAttribute('href').substr(1));
    setLightboxImage(targetIndex);
  });

  prevButton.addEventListener('click', function(e) {
    var targetIndex = parseInt(e.target.getAttribute('href').substr(1));
    setLightboxImage(targetIndex);
  });

  closeButton.addEventListener('click', function(e) {
    closeLightBox();
  });

  // takes in the query and number of pages that we wish to get from the search
  function getSearchResults(query, pages) {
    // we have to make multiple requests to get the images because the max they allow is 10
    for (var i=0; i<pages; i++) {
      // wrap XMLHttpRequest onreadystatechange in a closure so it knows
      // to use the current i in the loop iteration
      (function(i) {
        var requestUrl = CONFIG.urlSearch.replace(/\{\w+\}/g, function(match) {
          return {
            '{QUERY}': query,
            '{SEARCH_ENGINE_ID}': CONFIG.searchEngineId,
            '{START_INDEX}': 1 + (10*i),
            '{YOUR_API_KEY}': CONFIG.apiKey
          }[match];
        });

        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
          var results = {};
          if(req.readyState === 4) {
            if(req.status === 200) { 
              if (document.getElementById('loading')) {
                // would be nice to just do loader.remove() but browsers
                // make life difficult sometimes
                var loader = document.getElementById('loading');
                loader.parentElement.removeChild(loader);
              }
              results = JSON.parse(req.responseText);

              if (searchInputContainer.className != "results-view") {
                searchInputContainer.className = "results-view";
              }

              // if we find nothing and we haven't showed the error message already
              // and we are the first request
              if (results.searchInformation.totalResults == 0 && !document.getElementById('zeroResults')
                && i == 0) {
                
                handleZeroResults();

              } else if (results.items !== undefined) {
                var totalImages = searchResults.children.length;

                results.items.forEach(function(item, index, array) {
                  var anchor = document.createElement('a');
                  var img = document.createElement('img');
                  img.setAttribute('src', item.image.thumbnailLink);
                  img.setAttribute('alt', item.snippet);
                  img.setAttribute('class', "search-image");
                  img.setAttribute('data-index', index + totalImages);
                  img.setAttribute('data-image', item.link);
                  searchResults.appendChild(img);
                });
              }
            } else {
              // error handler
              showErrorGettingResults();
            } 
          }
        }
         
        req.open('GET', requestUrl);
        req.send();
      })(i);
    }
  }

  function clearResults() {
    while (searchResults.firstChild) {
      searchResults.removeChild(searchResults.firstChild);
    }
  }

  function showLoading() {
    var loadingTemplate = document.createElement('div');
    loadingTemplate.setAttribute("id", "loading");
    var loadingText = document.createTextNode("Loading...");
    loadingTemplate.appendChild(loadingText);
    searchResults.appendChild(loadingTemplate);
  }

  function handleZeroResults() {
    // its possible another async request was able to get images
    // so lets verify there are no images in the DOM already before
    // saying there were zero results
    if (!searchResults.firstChild) {
      var zeroResultsTemplate = document.createElement('div');
      zeroResultsTemplate.setAttribute("id", "zeroResults");
      var errorText = document.createTextNode("Sorry but we found 0 results :( try something else?");
      zeroResultsTemplate.appendChild(errorText);
      searchResults.appendChild(zeroResultsTemplate);
    }
  }

  function showErrorGettingResults() {
    var errorGettingResultsTemplate = document.createElement('div');
    errorGettingResultsTemplate.setAttribute("id", "errorGettingResults");
    var errorText = document.createTextNode("Something went wrong went fetching from the API.");
    errorGettingResultsTemplate.appendChild(errorText);
    searchResults.appendChild(errorGettingResultsTemplate);
  }

  function showLightBox(img) {
    var lightboxModal = document.getElementById("lightbox-modal");
    lightboxModal.style.display = "block";

    var index = parseInt(img.getAttribute('data-index'));
    setLightboxImage(index);
  }

  function setLightboxImage(index) {
    var img = searchResults.querySelectorAll('img[data-index="' + index +'"]')[0];
    currentImage.setAttribute('src', img.getAttribute('data-image'));
    currentImage.setAttribute('alt', img.getAttribute('alt'));
    currentImage.setAttribute('data-index', index);
    currentImageTitle.innerText = img.getAttribute('alt');
    nextButton.setAttribute('href', '#' + (index+1));
    prevButton.setAttribute('href', '#' + (index-1));

    // preload next and previous images
    var nextImgSrc = searchResults.querySelectorAll('img[data-index="' + (index+1) +'"]')[0].getAttribute('data-image');
    var prevImgSrc = searchResults.querySelectorAll('img[data-index="' + (index+1) +'"]')[0].getAttribute('data-image');

    var nextImg = new Image();
    var prevImg = new Image();
    nextImg.src = nextImgSrc;
    prevImg.src = prevImgSrc;
  }

  function closeLightBox() {
    var lightboxModal = document.getElementById("lightbox-modal");
    lightboxModal.style.display = "none";
  }
})();