/* =====================================================================
   THE SCIENCE — research library filter
   Loaded after ren-nu-pkd-en.js. Without JS every category stays visible.
   ===================================================================== */
(function () {
    function initLibraryFilter() {
        var buttons = document.querySelectorAll('.sci-filter__btn');
        var groups = document.querySelectorAll('.sci-lib__group');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter');

                buttons.forEach(function (b) {
                    b.setAttribute('aria-pressed', String(b === button));
                });
                groups.forEach(function (group) {
                    group.hidden = filter !== 'all' && group.getAttribute('data-category') !== filter;
                    // a group shown here may never have scrolled into view, so it
                    // would still be waiting for the shared reveal to fade it in
                    if (!group.hidden) group.classList.add('in-view');
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initLibraryFilter);
})();
