/* =====================================================================
   PKD DEUTSCH — waitlist form
   Loaded after ren-nu-pkd-en.js, whose initInterestPopup() opens and
   closes the popup. There is no #rennu-prefill-form on this page, so
   that function stops before its Windmill code and German signups stay
   out of the English interest list.
   ===================================================================== */
(function () {
    // german_rennu_waitlist_submit is handled by the live WordPress site, not
    // by anything in this repo. It rejects requests without a current nonce,
    // and WordPress nonces expire within a day, so one can't be stored here:
    // WordPress has to print it into the form's data-nonce attribute when it
    // renders the page. The request also has to come from ren-nu.org.
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

    function initWaitlistForm() {
        var form = document.querySelector('.grw-form');
        if (!form) return;

        var fieldsEl = form.querySelector('.grw-fields');
        var messageEl = form.querySelector('.grw-form-message');
        var submitBtn = form.querySelector('.grw-submit-btn');
        var howHeard = form.querySelector('select[name="how_heard"]');
        var otherField = form.querySelector('.grw-other-field');
        var otherInput = form.querySelector('input[name="how_heard_other"]');
        var consentInput = form.querySelector('input[name="email_consent"]');

        document.querySelectorAll('.sg-popup-id-850').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var firstField = fieldsEl.querySelector('input, select');
                if (firstField) firstField.focus({ preventScroll: true });
            });
        });

        howHeard.addEventListener('change', function () {
            var isOther = howHeard.value === grwConfig.otherValue;
            otherField.hidden = !isOther;
            otherInput.required = isOther;
            if (!isOther) otherInput.value = '';
        });

        function showError(text, focusEl) {
            messageEl.textContent = text;
            messageEl.className = 'grw-form-message grw-error';
            if (focusEl) focusEl.focus();
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (otherInput.required && otherInput.value.trim() === '') {
                showError(grwConfig.messages.other, otherInput);
                return;
            }
            if (!consentInput.checked) {
                showError(grwConfig.messages.consent, consentInput);
                return;
            }
            var invalidField = form.querySelector(':invalid');
            if (invalidField) {
                showError(invalidField.validity.typeMismatch ? grwConfig.messages.invalid : grwConfig.messages.required, invalidField);
                return;
            }

            var nonce = form.getAttribute('data-nonce');
            if (!nonce) {
                showError(grwConfig.messages.unavailable);
                return;
            }

            var formData = new FormData(form);
            formData.append('action', grwConfig.action);
            formData.append('nonce', nonce);

            submitBtn.disabled = true;
            messageEl.textContent = '';
            messageEl.className = 'grw-form-message';

            fetch(grwConfig.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: formData })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    if (json && json.success) {
                        fieldsEl.hidden = true;
                        messageEl.textContent = (json.data && json.data.message) || grwConfig.messages.success;
                        messageEl.className = 'grw-form-message grw-success';
                    } else {
                        submitBtn.disabled = false;
                        showError((json && json.data && json.data.message) || grwConfig.messages.generic);
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    showError(grwConfig.messages.generic);
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initWaitlistForm);
})();
