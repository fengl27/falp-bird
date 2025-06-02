const CACHE_NAME = 'game-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/bird.js',
  '/touch.js',
  '/tube.js',
  '/main.js',
  '/assets/background.png',
  '/assets/bird1.png',
  '/assets/bird2.png',
  '/assets/bird3.png',
  '/assets/floor.png',
  '/assets/game_over.png',
  '/assets/numbers.png',
  '/assets/play_flipped.png',
  '/assets/play.png',
  '/assets/score_thing.png',
  '/assets/small_numbers.png',
  '/assets/tube.png',
  '/icon.png'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async cache => {
        for (let file of urlsToCache) {
          try {
            await cache.add(file);
          } catch (err) {
            console.warn(`Failed to cache ${file}`, err);
          }
        }
      })
    );
  });

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) 
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
