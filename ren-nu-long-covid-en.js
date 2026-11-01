/* =====================================================================
   FOR LONG COVID — waitlist form
   Loaded after ren-nu-pkd-en.js, whose initInterestPopup() opens and
   closes the popup. There is no #rennu-prefill-form on this page, so
   that function stops before its Windmill code and Long COVID signups
   stay out of the PKD interest list.
   ===================================================================== */
(function () {
    // long_covid_waitlist_submit is handled by the live WordPress site, not by
    // anything in this repo. It rejects requests without a current nonce, and
    // WordPress nonces expire within a day, so one can't be stored here:
    // WordPress has to print it into the form's data-nonce attribute when it
    // renders the page. The request also has to come from ren-nu.org.
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

    function initWaitlistForm() {
        var form = document.querySelector('.lcw-form');
        if (!form) return;

        var fieldsEl = form.querySelector('.lcw-fields');
        var messageEl = form.querySelector('.lcw-form-message');
        var submitBtn = form.querySelector('.lcw-submit-btn');
        var howHeard = form.querySelector('select[name="how_heard"]');
        var otherField = form.querySelector('.lcw-other-field');
        var otherInput = form.querySelector('input[name="how_heard_other"]');

        document.querySelectorAll('.sg-popup-id-850').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var firstField = fieldsEl.querySelector('input, select');
                if (firstField) firstField.focus({ preventScroll: true });
            });
        });

        howHeard.addEventListener('change', function () {
            var isOther = howHeard.value === lcwConfig.otherValue;
            otherField.hidden = !isOther;
            otherInput.required = isOther;
            if (!isOther) otherInput.value = '';
        });

        function showError(text, focusEl) {
            messageEl.textContent = text;
            messageEl.className = 'lcw-form-message lcw-error';
            if (focusEl) focusEl.focus();
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (otherInput.required && otherInput.value.trim() === '') {
                showError(lcwConfig.messages.other, otherInput);
                return;
            }
            var invalidField = form.querySelector(':invalid');
            if (invalidField) {
                showError(invalidField.validity.typeMismatch ? lcwConfig.messages.invalid : lcwConfig.messages.required, invalidField);
                return;
            }

            var nonce = form.getAttribute('data-nonce');
            if (!nonce) {
                showError(lcwConfig.messages.unavailable);
                return;
            }

            var formData = new FormData(form);
            formData.append('action', lcwConfig.action);
            formData.append('nonce', nonce);

            submitBtn.disabled = true;
            messageEl.textContent = '';
            messageEl.className = 'lcw-form-message';

            fetch(lcwConfig.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: formData })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    if (json && json.success) {
                        fieldsEl.hidden = true;
                        messageEl.textContent = (json.data && json.data.message) || lcwConfig.messages.success;
                        messageEl.className = 'lcw-form-message lcw-success';
                    } else {
                        submitBtn.disabled = false;
                        showError((json && json.data && json.data.message) || lcwConfig.messages.generic);
                    }
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    showError(lcwConfig.messages.generic);
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initWaitlistForm);
})();
