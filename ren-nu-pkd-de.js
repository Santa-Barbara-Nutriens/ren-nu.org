/* =====================================================================
   PKD DEUTSCH — waitlist form
   Loaded after ren-nu-common.js, whose initInterestPopup() opens and
   closes the popup and whose RenNu.initWaitlistForm() runs the form.
   There is no #rennu-prefill-form on this page, so German signups stay
   out of the English interest list.
   ===================================================================== */
(function () {
    'use strict';

    var grwConfig = {
        ajaxUrl: 'https://ren-nu.org/wp-admin/admin-ajax.php',
        action: 'german_rennu_waitlist_submit',
        otherValue: 'Sonstiges',
        messages: {
            success: 'Vielen Dank für dein Interesse! Du stehst jetzt auf unserer Warteliste für Ren-Nu auf Deutsch. Eine Bestätigung ist per E-Mail auf dem Weg zu dir. Falls du sie nicht findest, schau bitte auch in deinem Spam-Ordner nach. Wir melden uns, sobald es Neuigkeiten zum Start und zur Anmeldung gibt.',
            required: 'Bitte fülle alle Pflichtfelder aus.',
            other: 'Bitte gib kurz an, wie du auf uns aufmerksam geworden bist.',
            consent: 'Bitte bestätige, dass wir dich per E-Mail informieren dürfen.',
            generic: 'Etwas ist schiefgelaufen. Bitte versuche es gleich noch einmal.',
            invalid: 'Bitte überprüfe deine Angaben und versuche es erneut.',
            unavailable: 'Die Anmeldung zur Warteliste ist gerade nicht möglich. Bitte schreib uns an info@ren-nu.org.'
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        window.RenNu.initWaitlistForm('grw', grwConfig);
    });
})();
