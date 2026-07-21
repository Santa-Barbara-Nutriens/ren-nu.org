(function () {
    'use strict';

    /* ===================== SCIENTIFIC NEWS FEED ===================== */
    // Easily exchangeable news items. `expire` = ISO date string; item is
    // hidden once today's date is past it. The FIRST item (index 0) is
    // always shown regardless of its expire date.
    var newsItems = [
        {
            title: 'New interim data on Total Kidney Volume reduction presented at ASN Kidney Week',
            image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
            date: '2026-06-18',
            expire: '2099-12-31' // always shown
        },
        {
            title: 'Study links metabolic ketogenic nutrition to improved eGFR trends in PKD cohort',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop',
            date: '2026-05-02',
            expire: '2026-08-01'
        },
        {
            title: 'Registered dietitians publish renal-safe low-oxalate meal planning guidance',
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=200&auto=format&fit=crop',
            date: '2026-04-11',
            expire: '2026-07-20'
        }
    ];

    function formatDate(iso) {
        var d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getValidNewsEntries() {
        var today = new Date();
        var entries = [];
        newsItems.forEach(function (item, index) {
            var expireDate = new Date(item.expire + 'T23:59:59');
            var isPinned = index === 0;
            if (!isPinned && expireDate < today) return; // skip expired, non-pinned items
            entries.push({ item: item, isPinned: isPinned });
        });
        return entries;
    }

    function buildNewsItemEl(entry) {
        var li = document.createElement('li');
        li.className = 'news-item';
        li.innerHTML =
            '<img src="' + entry.item.image + '" alt="" loading="lazy">' +
            '<div class="news-item-body">' +
            '<span class="news-item-title">' + entry.item.title + (entry.isPinned ? '<span class="news-item-pinned">Featured</span>' : '') + '</span>' +
            '<span class="news-item-meta">' + formatDate(entry.item.date) + '</span>' +
            '</div>';
        return li;
    }

    function initNewsFeed() {
        var list = document.getElementById('newsList');
        var dotsWrap = document.getElementById('newsDots');
        if (!list) return;
        var entries = getValidNewsEntries();
        if (!entries.length) return;
        var current = 0;
        var timer;

        if (dotsWrap) {
            dotsWrap.innerHTML = '';
            entries.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.setAttribute('aria-label', 'Show news item ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', function () { show(i); resetTimer(); });
                dotsWrap.appendChild(dot);
            });
        }
        var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

        function show(index) {
            current = (index + entries.length) % entries.length;
            list.innerHTML = '';
            var li = buildNewsItemEl(entries[current]);
            list.appendChild(li);
            requestAnimationFrame(function () { li.classList.add('news-fade-in'); });
            dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
        }

        function resetTimer() {
            clearInterval(timer);
            if (entries.length > 1) {
                timer = setInterval(function () { show(current + 1); }, 5000);
            }
        }

        show(0);
        resetTimer();
    }

    /* ===================== GENERIC CAROUSEL ===================== */
    function initCarousels() {
        document.querySelectorAll('[data-carousel]').forEach(function (root) {
            var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
            var dotsWrap = root.querySelector('[data-dots]');
            var prevBtn = root.querySelector('[data-prev]');
            var nextBtn = root.querySelector('[data-next]');
            var current = 0;
            var timer;

            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', function () { goTo(i); resetTimer(); });
                dotsWrap.appendChild(dot);
            });
            var dots = Array.prototype.slice.call(dotsWrap.children);

            function goTo(index) {
                slides[current].classList.remove('active');
                dots[current].classList.remove('active');
                current = (index + slides.length) % slides.length;
                slides[current].classList.add('active');
                dots[current].classList.add('active');
            }

            function resetTimer() {
                clearInterval(timer);
                timer = setInterval(function () { goTo(current + 1); }, 7000);
            }

            if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
            if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetTimer(); });

            resetTimer();
        });
    }

    /* ===================== SCROLL REVEAL ===================== */
    function initReveal() {
        var targets = document.querySelectorAll('[data-reveal]');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(function (t) { t.classList.add('in-view'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        targets.forEach(function (t) { observer.observe(t); });
    }

    /* ===================== JUMP NAV ACTIVE STATE ===================== */
    function initJumpNav() {
        var links = Array.prototype.slice.call(document.querySelectorAll('[data-jump]'));
        if (!links.length) return;
        var sections = links.map(function (link) {
            return document.querySelector(link.getAttribute('href'));
        }).filter(Boolean);

        if (!('IntersectionObserver' in window)) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var link = links[sections.indexOf(entry.target)];
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach(function (l) { l.classList.remove('active'); });
                    link.classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (s) { observer.observe(s); });
    }

    /* ===================== MOBILE NAV TOGGLE ===================== */
    function initMobileNav() {
        var toggle = document.getElementById('navToggle');
        var jump = document.getElementById('jumpNav');
        if (!toggle || !jump) return;
        toggle.addEventListener('click', function () {
            var open = jump.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        jump.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                jump.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ===================== ACCOUNT MENU TOGGLE ===================== */
    function initAccountMenu() {
        var toggle = document.getElementById('accountToggle');
        var menu = document.getElementById('accountMenu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('click', function () {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    /* ===================== TEAM VIDEO START OFFSET ===================== */
    function initTeamVideoStart() {
        var video = document.querySelector('.team-video[data-start-time]');
        if (!video) return;

        var startTime = parseFloat(video.getAttribute('data-start-time'));
        if (isNaN(startTime) || startTime < 0) return;

        video.addEventListener('loadedmetadata', function () {
            try {
                video.currentTime = startTime;
            } catch (err) {
                // Some browsers may block seeking until playback begins.
            }
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
        initNewsFeed();
        initCarousels();
        initReveal();
        initJumpNav();
        initMobileNav();
        initAccountMenu();
        initTeamVideoStart();
        initPlaylistRotationDelay();
    });
})();
