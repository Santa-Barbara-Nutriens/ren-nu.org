/* =====================================================================
   PKD ENGLISH — code used only by ren-nu-pkd-en.html
   Loaded after ren-nu-common.js.
   ===================================================================== */
(function () {
    'use strict';

    /* ===================== SHORTS ROW (Section 11) ===================== */
    function initShortsRow() {
        document.querySelectorAll('[data-shorts-track]').forEach(function (track) {
            var row = track.closest('.shorts-row');
            var prevBtn = row.querySelector('[data-shorts-prev]');
            var nextBtn = row.querySelector('[data-shorts-next]');

            function scrollByCard(direction) {
                var card = track.querySelector('.short-card');
                var amount = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
                track.scrollBy({ left: amount * direction, behavior: 'smooth' });
            }

            if (prevBtn) prevBtn.addEventListener('click', function () { scrollByCard(-1); });
            if (nextBtn) nextBtn.addEventListener('click', function () { scrollByCard(1); });
        });
    }

    /* ===================== TEAM VIDEO START OFFSET ===================== */
    function initTeamVideoStart() {
        var video = document.querySelector('.team-video[data-start-time]');
        if (!video) return;

        var startTime = parseFloat(video.getAttribute('data-start-time'));
        if (isNaN(startTime) || startTime < 0) return;

        video.addEventListener('loadedmetadata', function () {
            video.currentTime = startTime;
        });

        video.addEventListener('canplay', function handleCanPlay() {
            video.removeEventListener('canplay', handleCanPlay);

            var wasMuted = video.muted;
            video.muted = true;

            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.then === 'function') {
                playAttempt.then(function () {
                    video.pause();
                    video.currentTime = startTime;
                    video.muted = wasMuted;
                }).catch(function () {
                    video.currentTime = startTime;
                    video.muted = wasMuted;
                });
            } else {
                video.pause();
                video.currentTime = startTime;
                video.muted = wasMuted;
            }
        });
    }

    /* ===================== SHORT PREVIEWS (Section 05) ===================== */
    // Shows each short's poster image as a clean preview: native controls are
    // hidden and nothing is downloaded until the visitor clicks the card, then
    // the video starts with its controls. Starting one short pauses the others.
    // Without JS the videos keep their native controls and still work.
    function initShortPreviews() {
        var videos = [];
        document.querySelectorAll('.short-card--video').forEach(function (card) {
            var video = card.querySelector('video');
            if (!video || !video.getAttribute('poster')) return;
            videos.push(video);
            video.removeAttribute('data-lazy-video');
            video.preload = 'none';
            video.controls = false;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'short-card__preview-play';
            btn.setAttribute('aria-label', 'Play video');
            card.appendChild(btn);

            btn.addEventListener('click', function () {
                btn.remove();
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') attempt.catch(function () {});
            });

            video.addEventListener('play', function () {
                videos.forEach(function (other) {
                    if (other !== video && !other.paused) other.pause();
                });
            });
        });
    }

    /* ===================== LAZY VIDEOS ===================== */
    // preload="none" keeps videos from fetching anything at page load; once
    // one nears the screen it loads its metadata and first frame as usual.
    function initLazyVideos() {
        var videos = document.querySelectorAll('video[data-lazy-video]');
        function load(video) {
            video.preload = 'metadata';
            video.load();
        }
        if (!('IntersectionObserver' in window)) {
            videos.forEach(load);
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    load(entry.target);
                }
            });
        }, { rootMargin: '300px 0px' });
        videos.forEach(function (v) { observer.observe(v); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initShortsRow();
        initTeamVideoStart();
        initShortPreviews();
        initLazyVideos();
    });
})();
