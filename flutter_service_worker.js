'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "af1e1f32ff18d2c9e3a888acdf3f2377",
"index.html": "32e9dcf159b28e5bf0eccff9b1835384",
"/": "32e9dcf159b28e5bf0eccff9b1835384",
"main.dart.js": "fe4e0ca2f6c1a9319b74ed840b4a9933",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "3b2874b9ecceac4a73214580953a8de8",
"assets/AssetManifest.json": "e6dc98914b8259d46acd49bd802f1b56",
"assets/NOTICES": "0f6ea4cc14f1c5d876bfe72fd7ff2beb",
"assets/FontManifest.json": "09f907f86af72daf971571e9c0f3085a",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/ironclad_bold.otf": "0b2e130a507a557d8d75f32f0c3df090",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/fonts/ironclad_regular.otf": "0ac0c5ebeb618916515246a9615af906",
"assets/fonts/ironclad_light.otf": "7b22bba26368d94729f73ffc4935b989",
"assets/assets/images/golden_frame.png": "4bc7bad31475cbd7e6fbe4a42a43a77d",
"assets/assets/images/mini_frame.png": "c8f27a938618425c36692a20cae6a6c9",
"assets/assets/images/reference_image.png": "4e2fbd67dbd07554808abd0c1590dd38",
"assets/assets/images/background.png": "778a00daf678aeb3c079f85d52241d75",
"assets/assets/images/ribbon.png": "74e526ac803d11f86531bb014d7daa15",
"assets/assets/images/main_frame.png": "3d4bec6b53f435673fed7d18c4ac3461",
"assets/assets/photos/IMG18.jpg": "e317d86702e3a0b824a892ca252e422a",
"assets/assets/photos/IMG9.jpg": "77286bd100342179e241af64a69c2eb6",
"assets/assets/photos/IMG8.jpg": "6600b63c01c69e5526d9be1448eb8cda",
"assets/assets/photos/IMG5.jpg": "22ea84694dcad0dd31770d7afd530e4a",
"assets/assets/photos/IMG4.jpg": "296ce9fdc9effe50fbb6c6423fc38864",
"assets/assets/photos/IMG6.jpg": "64d002d8ff22469c09ee63926acb1c7a",
"assets/assets/photos/IMG7.jpg": "bcb88483d8f2570c2421944e5001f527",
"assets/assets/photos/IMG3.jpg": "0bb51fb094c63b0d6d64f64b6a9afbb1",
"assets/assets/photos/IMG2.jpg": "7dd90fc1dff93040324198eb6b0ec43a",
"assets/assets/photos/IMG0.jpg": "1c9c5e3a5daa187bf98036099f7784a2",
"assets/assets/photos/IMG1.jpg": "7c4fdf4d9e21a29550af0a067246526e",
"assets/assets/photos/IMG17.jpg": "a5daa36bbbde74b8b171b31bcbdfb1ce",
"assets/assets/photos/IMG16.jpg": "450922daf65a8421f8972ce22802a4ed",
"assets/assets/photos/IMG14.jpg": "ef11a6f8587a276e5dbc9b9107b3ad9b",
"assets/assets/photos/IMG15.jpg": "4fcc5d09aa553de18a966c3225abe4e8",
"assets/assets/photos/IMG11.jpg": "841a6a6445e69aae70ef3e7fc31d2208",
"assets/assets/photos/IMG10.jpg": "ac0191f868bda17fcc2d1f285c879688",
"assets/assets/photos/IMG12.jpg": "9ec4c098b0160a861f52be1e1cf7970d",
"assets/assets/photos/IMG13.jpg": "e961d09294e64e4ac13a46958d40af92"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
