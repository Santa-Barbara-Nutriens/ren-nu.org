/* =====================================================================
   THE SCIENCE — carousel, video playlist and research library filter
   Loaded after ren-nu-common.js. Without JS every category stays visible.
   ===================================================================== */
(function () {
    'use strict';

    /* ===================== GENERIC CAROUSEL ===================== */
    function initCarousels() {
        document.querySelectorAll('[data-carousel]').forEach(function (root) {
            var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
            var dotsWrap = root.querySelector('[data-dots]');
            var prevBtn = root.querySelector('[data-prev]');
            var nextBtn = root.querySelector('[data-next]');
            var pauseBtn = root.querySelector('[data-pause]');
            var controls = root.querySelector('.carousel-controls');
            var paused = !!pauseBtn && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var current = 0;
            var timer;

            slides.forEach(function (slide, i) {
                var dot = document.createElement('button');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                slide.classList.toggle('active', i === 0);
                dot.addEventListener('click', function () { goTo(i); resetTimer(); });
                dotsWrap.appendChild(dot);
            });
            var dots = Array.prototype.slice.call(dotsWrap.children);
            if (controls) controls.hidden = slides.length < 2;

            function goTo(index) {
                slides[current].classList.remove('active');
                dots[current].classList.remove('active');
                current = (index + slides.length) % slides.length;
                slides[current].classList.add('active');
                dots[current].classList.add('active');
            }

            function resetTimer() {
                clearInterval(timer);
                if (paused || slides.length < 2) return;
                timer = setInterval(function () {
                    // don't rotate a link away from someone about to use it
                    if (root.matches(':hover') || root.querySelector(':focus-visible')) return;
                    goTo(current + 1);
                }, 7000);
            }

            if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
            if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetTimer(); });
            if (pauseBtn) {
                pauseBtn.setAttribute('aria-pressed', String(paused));
                pauseBtn.addEventListener('click', function () {
                    paused = !paused;
                    pauseBtn.setAttribute('aria-pressed', String(paused));
                    resetTimer();
                });
            }

            resetTimer();
        });
    }

    /* ===================== PLAYLIST ROTATION DELAY ===================== */
    function initPlaylistRotationDelay() {
        var frame = document.querySelector('.video-playlist-frame[data-rotate-delay]');
        if (!frame) return;

        var delayMs = parseInt(frame.getAttribute('data-rotate-delay'), 10);
        if (isNaN(delayMs) || delayMs < 0) delayMs = 2500;

        var timer;
        var player;

        function clearDelayTimer() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }

        function createPlayer() {
            if (!(window.YT && window.YT.Player)) return;

            player = new window.YT.Player(frame.id, {
                events: {
                    onStateChange: function (event) {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            clearDelayTimer();
                            timer = setTimeout(function () {
                                try {
                                    player.nextVideo();
                                    player.playVideo();
                                } catch (err) {
                                    // If player is unavailable, fail silently.
                                }
                            }, delayMs);
                        } else {
                            clearDelayTimer();
                        }
                    }
                }
            });
        }

        if (window.YT && window.YT.Player) {
            createPlayer();
            return;
        }

        var previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (typeof previousReady === 'function') previousReady();
            createPlayer();
        };

        if (!document.querySelector('script[data-yt-api="true"]')) {
            var script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.setAttribute('data-yt-api', 'true');
            document.head.appendChild(script);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initCarousels();
        initPlaylistRotationDelay();
        window.RenNu.initCategoryFilter('.sci-filter__btn', 'data-filter', '.sci-lib__group');
    });
})();
