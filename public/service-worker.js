const CACHE_FILES = [
    "/", 
    "/index.html", 
    "/index.js", 
    "/favicon.ico", 
    "/styles.css", 
    "/icons/icon-144x144.png",
    "/icons/icon-192x192.png", 
    "/icons/icon-512x512.png"
  ];
  
  const NAME_CACHE = "static-cache-v2";
  const CACHE_DATA_NAME = "data-cache-v1";
  
  // install
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(NAME_CACHE).then(cache => {
        console.log("files have been cached!");
        return cache.addAll(CACHE_FILES);
      })
    );
  
    self.skipWaiting();
  });
  
  // activate
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== NAME_CACHE && key !== CACHE_DATA_NAME) {
              console.log("Deleting Cache files", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // fetch
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(CACHE_DATA_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });