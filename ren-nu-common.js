/* =====================================================================
   REN-NU COMMON — code shared by all ren-nu-*.html pages
   Load this before any page-specific script. Every init below does
   nothing on a page that lacks its markup, so it is safe to load
   everywhere. Helpers that page scripts call are exposed on
   window.RenNu.
   ===================================================================== */
(function () {
    'use strict';

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

    /* ===================== HEADER LOGO → LAST HOME PAGE ===================== */
    // Pages with <body data-home> (landing + subject pages) remember themselves;
    // shared sub pages point their header logo back to that page. Without a
    // stored value (direct entry, storage blocked) the logo keeps its href.
    var HOME_KEY = 'rennuHome';

    function initHomeLogo() {
        try {
            if (document.body.hasAttribute('data-home')) {
                sessionStorage.setItem(HOME_KEY, location.pathname);
                return;
            }
            var home = sessionStorage.getItem(HOME_KEY);
            var logo = document.querySelector('#siteHeader .logo');
            if (home && logo) logo.setAttribute('href', home);
        } catch (e) { /* storage unavailable — keep default href */ }
    }

    /* ===================== HERO GIF — PLAY ON HOVER ===================== */
    function initHeroGifHover() {
        var wrap = document.getElementById('heroGifHover');
        if (!wrap) return;

        var canvas = wrap.querySelector('.hero-split__poster');
        var gif = wrap.querySelector('.hero-split__gif');
        if (!canvas || !gif) return;

        var ctx = canvas.getContext('2d');
        var baseSrc = gif.getAttribute('src');
        var isGif = /\.gif$/i.test(baseSrc);

        function drawPoster() {
            canvas.width = gif.naturalWidth;
            canvas.height = gif.naturalHeight;
            try {
                ctx.drawImage(gif, 0, 0, canvas.width, canvas.height);
            } catch (err) {
                // Canvas stays blank if the frame can't be captured; harmless.
            }
        }

        if (gif.complete) {
            drawPoster();
        } else {
            gif.addEventListener('load', drawPoster, { once: true });
        }

        // Reloading the src on every hover restarts the gif from frame one;
        // it plays through and, if the file loops once, stops on its own.
        // A still image has nothing to restart, so it isn't downloaded again.
        wrap.addEventListener('mouseenter', function () {
            if (isGif) {
                gif.src = baseSrc + (baseSrc.indexOf('?') === -1 ? '?' : '&') + 'play=' + Date.now();
            }
            wrap.classList.add('is-playing');
        });

        wrap.addEventListener('mouseleave', function () {
            wrap.classList.remove('is-playing');
        });
    }

    /* ===================== SCIENTIFIC NEWS FEED ===================== */
    // Not used by any current ren-nu-*.html page (no #newsList); kept for
    // the older drafts that still have the markup.
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

    /* ===================== ACCOUNT MENU TOGGLE ===================== */
    // Not used by any current ren-nu-*.html page (no #accountToggle); kept
    // for the older drafts that still have the markup.
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

    /* =====================================================================
       HELPERS FOR PAGE SCRIPTS (window.RenNu)
       ===================================================================== */

    /* ----- Category filter buttons -----
       Buttons carry the category in `filterAttr` ("all" shows everything);
       items carry theirs in data-category. Used by The Science (research
       library) and Resources (resource cards). */
    function initCategoryFilter(buttonSelector, filterAttr, itemSelector) {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(buttonSelector));
        if (!buttons.length) return;
        var items = document.querySelectorAll(itemSelector);
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute(filterAttr);
                buttons.forEach(function (b) {
                    b.setAttribute('aria-pressed', String(b === button));
                });
                items.forEach(function (item) {
                    item.hidden = filter !== 'all' && item.getAttribute('data-category') !== filter;
                    // an item shown here may never have scrolled into view, so it
                    // would still be waiting for the scroll reveal to fade it in
                    if (!item.hidden) item.classList.add('in-view');
                });
            });
        });
    }

    /* ----- WordPress waitlist form (inside the interest popup) -----
       `prefix` is the form's class prefix (e.g. "grw" → .grw-form,
       .grw-fields, .grw-form-message, .grw-submit-btn, .grw-other-field).
       `config` = { ajaxUrl, action, otherValue, messages: { success,
       required, other, invalid, generic, unavailable, consent? } }.
       The consent check only runs if the form has an email_consent box.

       The WordPress action is handled by the live site, not by anything in
       this repo. It rejects requests without a current nonce, and WordPress
       nonces expire within a day, so one can't be stored here: WordPress has
       to print it into the form's data-nonce attribute when it renders the
       page. The request also has to come from ren-nu.org. */
    function initWaitlistForm(prefix, config) {
        var form = document.querySelector('.' + prefix + '-form');
        if (!form) return;

        var fieldsEl = form.querySelector('.' + prefix + '-fields');
        var messageEl = form.querySelector('.' + prefix + '-form-message');
        var submitBtn = form.querySelector('.' + prefix + '-submit-btn');
        var howHeard = form.querySelector('select[name="how_heard"]');
        var otherField = form.querySelector('.' + prefix + '-other-field');
        var otherInput = form.querySelector('input[name="how_heard_other"]');
        var consentInput = form.querySelector('input[name="email_consent"]');
        var messageClass = prefix + '-form-message';

        document.querySelectorAll('.sg-popup-id-850').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var firstField = fieldsEl.querySelector('input, select');
                if (firstField) firstField.focus({ preventScroll: true });
            });
        });

        howHeard.addEventListener('change', function () {
            var isOther = howHeard.value === config.otherValue;
            otherField.hidden = !isOther;
            otherInput.required = isOther;
            if (!isOther) otherInput.value = '';
        });

        function showError(text, focusEl) {
            messageEl.textContent = text;
            messageEl.className = messageClass + ' ' + prefix + '-error';
            if (focusEl) focusEl.focus();
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (otherInput.required && otherInput.value.trim() === '') {
                showError(config.messages.other, otherInput);
                return;
            }
            if (consentInput && !consentInput.checked) {
                showError(config.messages.consent, consentInput);
                return;
            }
            var invalidField = form.querySelector(':invalid');
            if (invalidField) {
                showError(invalidField.validity.typeMismatch ? config.messages.invalid : config.messages.required, invalidField);
                return;
            }

            var nonce = form.getAttribute('data-nonce');
            if (!nonce) {
                showError(config.messages.unavailable);
                return;
            }

            var formData = new FormData(form);
            formData.append('action', config.action);
            formData.append('nonce', nonce);

            submitBtn.disabled = true;
            messageEl.textContent = '';
            messageEl.className = messageClass;

            fetch(config.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: formData })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    if (json && json.success) {
                        fieldsEl.hidden = true;
                        messageEl.textContent = (json.data && json.data.message) || config.messages.success;
                        messageEl.className = messageClass + ' ' + prefix + '-success';
                    } else {
                        submitBtn.disabled = false;
                        showError((json && json.data && json.data.message) || config.messages.generic);
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    showError(config.messages.generic);
                });
        });
    }

    //     /* ===================== INTEREST FORM POPUP ===================== */
    // function initInterestPopup() {
    //     var popup = document.querySelector('.sgpb-main-popup-data-container-850');
    //     if (!popup) return;

    //     var box = popup.querySelector('.sg-popup-builder-content');
    //     var triggers = document.querySelectorAll('.sg-popup-id-850');
    //     if (!triggers.length) return;

    //     // Popup Builder's own close button was removed along with the plugin,
    //     // so add a lightweight one here.
    //     var closeBtn = popup.querySelector('.sgpb-popup-close-btn');
    //     if (!closeBtn && box) {
    //         closeBtn = document.createElement('button');
    //         closeBtn.type = 'button';
    //         closeBtn.className = 'sgpb-popup-close-btn';
    //         closeBtn.setAttribute('aria-label', 'Close');
    //         closeBtn.innerHTML = '&times;';
    //         box.insertBefore(closeBtn, box.firstChild);
    //     }

    //     function openPopup(e) {
    //         if (e) e.preventDefault();
    //         popup.classList.add('sgpb-popup-open');
    //         document.body.style.overflow = 'hidden';
    //     }

    //     function closePopup() {
    //         popup.classList.remove('sgpb-popup-open');
    //         document.body.style.overflow = '';
    //     }

    //     triggers.forEach(function (trigger) {
    //         trigger.addEventListener('click', openPopup);
    //     });

    //     if (closeBtn) closeBtn.addEventListener('click', closePopup);

    //     // Click on the dark backdrop (outside the popup box) closes it.
    //     popup.addEventListener('click', function (e) {
    //         if (e.target === popup) closePopup();
    //     });

    //     document.addEventListener('keydown', function (e) {
    //         if (e.key === 'Escape') closePopup();
    //     });

    //     // Prefill form -> submit captured fields straight to a Windmill webhook.
    //     // Pages with their own waitlist form (PKD Deutsch, Long COVID) have no
    //     // #rennu-prefill-form, so this stops here and their signups stay out
    //     // of the English interest list.
    //     //
    //     // NOTE: this runs in the visitor's browser, so the Bearer token below
    //     // is visible to anyone via "View Source" / devtools the moment this
    //     // page is live — deliberately accepted here (matches WindMill_socet.ts)
    //     // rather than switching the trigger to public/anonymous access.
    //     // Treat this token as public: don't reuse it for anything with wider
    //     // permissions, and rotate it in Windmill if that ever becomes a problem.
    //     var WINDMILL_WEBHOOK_URL = 'https://app.windmill.dev/api/w/sbn-dev/jobs/run_wait_result/p/f/leads/submit_interest';
    //     var WINDMILL_TOKEN = 'tvCyPtjhzjk389OVDFdXCIitgEhpCwbp';

    //     var form = document.getElementById('rennu-prefill-form');
    //     if (!form) return;

    //     var submitBtn = form.querySelector('button[type="submit"]');

    //     // Gate the Continue button on first name, last name and email being
    //     // filled in (phone stays required for submission but doesn't block
    //     // enabling the button).
    //     var gatedFields = [form.first_name, form.last_name, form.email];

    //     function updateSubmitState() {
    //         var filled = gatedFields.every(function (field) {
    //             return field.value.trim() !== '' && field.checkValidity();
    //         });
    //         if (submitBtn) {
    //             submitBtn.disabled = !filled;
    //             submitBtn.style.background = filled ? '#186079' : '#9aa5a3';
    //             submitBtn.style.cursor = filled ? 'pointer' : 'not-allowed';
    //         }
    //     }

    //     gatedFields.forEach(function (field) {
    //         field.addEventListener('input', updateSubmitState);
    //     });

    //     updateSubmitState();

    //     form.addEventListener('submit', function (e) {
    //         e.preventDefault();

    //         var payload = {
    //             first_name: form.first_name.value.trim(),
    //             last_name: form.last_name.value.trim(),
    //             email: form.email.value.trim(),
    //             phone_number: form.phone.value.trim()
    //         };

    //         if (submitBtn) {
    //             submitBtn.disabled = true;
    //             submitBtn.textContent = 'Submitting...';
    //         }

    //         fetch(WINDMILL_WEBHOOK_URL, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': 'Bearer ' + WINDMILL_TOKEN,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(payload)
    //         })
    //             .then(function (response) {
    //                 if (!response.ok) throw new Error('Request failed: ' + response.status);
    //                 form.innerHTML = '<p style="text-align:center;font-weight:600;">Thanks! Your interest form has been submitted.</p>';
    //             })
    //             .catch(function (err) {
    //                 console.error('Windmill webhook submission failed:', err);
    //                 if (submitBtn) {
    //                     submitBtn.disabled = false;
    //                     submitBtn.textContent = 'Continue';
    //                 }
    //                 var errorEl = form.querySelector('.rennu-form-error');
    //                 if (!errorEl) {
    //                     errorEl = document.createElement('p');
    //                     errorEl.className = 'rennu-form-error';
    //                     errorEl.style.color = '#c0392b';
    //                     form.appendChild(errorEl);
    //                 }
    //                 errorEl.textContent = 'Something went wrong submitting the form. Please try again.';
    //             });
    //     });
    // }

    /* ===================== INTEREST FORM POPUP ===================== */
    function initInterestPopup() {
        var popup = document.querySelector('.sgpb-main-popup-data-container-850');
        if (!popup) return;

        var box = popup.querySelector('.sg-popup-builder-content');
        var triggers = document.querySelectorAll('.sg-popup-id-850');
        if (!triggers.length) return;

        // Popup Builder's own close button was removed along with the plugin,
        // so add a lightweight one here.
        var closeBtn = popup.querySelector('.sgpb-popup-close-btn');
        if (!closeBtn && box) {
            closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'sgpb-popup-close-btn';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.innerHTML = '&times;';
            box.insertBefore(closeBtn, box.firstChild);
        }

        function openPopup(e) {
            if (e) e.preventDefault();
            popup.classList.add('sgpb-popup-open');
            document.body.style.overflow = 'hidden';
        }

        function closePopup() {
            popup.classList.remove('sgpb-popup-open');
            document.body.style.overflow = '';
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', openPopup);
        });

        if (closeBtn) closeBtn.addEventListener('click', closePopup);

        // Click on the dark backdrop (outside the popup box) closes it.
        popup.addEventListener('click', function (e) {
            if (e.target === popup) closePopup();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closePopup();
        });

        // Prefill form -> ren-nu.org's own WordPress backend (admin-ajax.php).
        // WordPress adds the Windmill token server-side (Code Snippets snippet
        // "Ren-Nu Sign-up Webhook Call"), so this file contains no secrets and
        // must never contain any: no tokens, no app.windmill.dev URLs.
        // Contract: sbnutrients/windmillDev docs/rennu_signup_form_plan.md
        var SIGNUP_AJAX_URL = 'https://ren-nu.org/wp-admin/admin-ajax.php';

        var form = document.getElementById('rennu-prefill-form');
        if (!form) return;

        var submitBtn = form.querySelector('button[type="submit"]');
        var messageEl = form.querySelector('.rennu-form-message');
        if (!messageEl) {
            messageEl = document.createElement('p');
            messageEl.className = 'rennu-form-message';
            messageEl.setAttribute('role', 'status');
            form.appendChild(messageEl);
        }

        // Gate the Continue button on first name, last name and email being
        // filled in. Phone is optional.
        var gatedFields = [form.first_name, form.last_name, form.email];

        function updateSubmitState() {
            var filled = gatedFields.every(function (field) {
                return field.value.trim() !== '' && field.checkValidity();
            });
            if (submitBtn) {
                submitBtn.disabled = !filled;
                submitBtn.style.background = filled ? '#186079' : '#9aa5a3';
                submitBtn.style.cursor = filled ? 'pointer' : 'not-allowed';
            }
        }

        function showMessage(text, isError) {
            messageEl.textContent = text;
            messageEl.style.color = isError ? '#c0392b' : '#1a7a3c';
        }

        function resetButton() {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
            }
        }

        gatedFields.forEach(function (field) {
            field.addEventListener('input', updateSubmitState);
        });

        updateSubmitState();

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }
            showMessage('', false);

            // 1. Get a fresh nonce (the page HTML is static, so it can't contain one).
            fetch(SIGNUP_AJAX_URL + '?action=rennu_signup_nonce', { credentials: 'omit' })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    if (!json || !json.success) {
                        throw new Error((json && json.data && json.data.message) || 'No nonce');
                    }
                    // 2. Submit. Field names match the backend: first_name, last_name,
                    //    email, phone_number (optional), plus the empty honeypot rsu_hp.
                    var formData = new FormData(form);
                    formData.append('action', 'rennu_signup_submit');
                    formData.append('nonce', json.data.nonce);
                    return fetch(SIGNUP_AJAX_URL, { method: 'POST', credentials: 'omit', body: formData });
                })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    var text = (json && json.data && json.data.message) || '';
                    if (json && json.success) {
                        form.innerHTML = '<p style="text-align:center;font-weight:600;"></p>';
                        form.firstChild.textContent = text || 'Thank you!';
                    } else {
                        // Backend messages are written for visitors,
                        // e.g. "Please enter a valid email address."
                        showMessage(text || 'Something went wrong. Please try again.', true);
                        resetButton();
                    }
                })
                .catch(function (err) {
                    console.error('Sign-up submission failed:', err);
                    showMessage('Something went wrong submitting the form. Please try again.', true);
                    resetButton();
                });
        });
    }

    window.RenNu = {
        initCategoryFilter: initCategoryFilter,
        initWaitlistForm: initWaitlistForm
    };

    document.addEventListener('DOMContentLoaded', function () {
        initNewsFeed();
        initReveal();
        initJumpNav();
        initMobileNav();
        initHomeLogo();
        initAccountMenu();
        initInterestPopup();
        initHeroGifHover();
    });
})();
