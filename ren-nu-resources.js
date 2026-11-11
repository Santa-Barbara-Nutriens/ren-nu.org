/* =====================================================================
   RESOURCES — resource card filter
   Loaded after ren-nu-common.js. Without JS every card stays visible.
   ===================================================================== */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        window.RenNu.initCategoryFilter('[data-res-filter]', 'data-res-filter', '.res-card');
    });
})();
