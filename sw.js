const CACHE_NAME = 'pwa_appgram_cache'
const urlsToCache = [
    '/',
    'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.0/css/bulma.min.css'
  ];

self.addEventListener('install', (event) => {

  console.log('SW Installed');

  event.waitUntil(
    caches.open(CACHE_NAME) // devuelve una Promise
      .then(cache => {
        console.log('Archivos en cache')
        return cache.addAll(urlsToCache)
      })
  );

})

self.addEventListener('activate', event => {
  console.log('SW Activated');

  const cache_list = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then(caches_names => {
        return Promise.all(
          caches_names.map(cache_name => {
            if (cache_list.indexOf(cache_name) === -1)
              return caches.delete(cache_name);
          })
        );
      })
      .then(() => {
        console.log('Cache clear');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  console.log('SW Fetching');

  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) return res;
      else {
        fetch(event.request).then(res => {
          let res_to_cache = res.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache
              .put(event.request, res_to_cache)
              .catch(err =>
                console.log(event.request.url, event.request.message)
              );
          });

          return res;
        });
      }
    })
  );
});

self.addEventListener('push', (event) => {

  console.log('SW Push');

  let title = 'Push Notification',
    options = {
      body: 'Click to open App',
      icon: './assets/img/icon_144x144.png',
      vibrate: [100, 50, 100],
      data: { id: 1 },
      actions: [
        { 'action': 'Yes', 'title': 'I Like this App', 'icon': './assets/img/icon_144x144.png' },
        { 'action': 'No', 'title': 'I hate this App', 'icon': './assets/img/icon_144x144.png' }
      ]
    }

  event.waitUntil(self.registration.showNotification(title, options));

});


self.addEventListener('sync', (event) => {
  console.log('SW Sync', event);

  if (event.tag === 'github') { // comprobar si las tags coincidan
    event.waitUntil(
      self.clients.matchAll()
        .then(all => {
          return all.map(client => {
            return client.postMessage('online')
          })
        })
        .catch(err => console.log(err))
    )
  }

});


// self.addEventListener('message', (event) => {
//   console.log('SW Message', event);

//   fetchGithubUser(localStorage.getItem('github'), true);

// });
