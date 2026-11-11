/* =====================================================================
   FOR LONG COVID — waitlist form
   Loaded after ren-nu-common.js, whose initInterestPopup() opens and
   closes the popup and whose RenNu.initWaitlistForm() runs the form.
   There is no #rennu-prefill-form on this page, so Long COVID signups
   stay out of the PKD interest list.
   ===================================================================== */
(function () {
    'use strict';

    var lcwConfig = {
        ajaxUrl: 'https://ren-nu.org/wp-admin/admin-ajax.php',
        action: 'long_covid_waitlist_submit',
        otherValue: 'Other',
        messages: {
            success: 'Thank you!',
            required: 'Please fill in all required fields.',
            other: 'Please tell us where you heard about us.',
            invalid: 'Please check your details and try again.',
            generic: 'Something went wrong. Please try again.',
            unavailable: 'The waitlist is unavailable right now. Please email us at info@ren-nu.org.'
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        window.RenNu.initWaitlistForm('lcw', lcwConfig);
    });
})();
