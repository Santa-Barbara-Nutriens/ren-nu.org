/**
 * Interact with Windmill's webhooks using standard fetch.
 *
 * @param webhookUrl {string} Webhook URL from Script Details page
 * @param scriptArgs {Object} JSON with arguments to pass
 * to the underlying script/flow
 * @param token {string} User token from User Settings page
 */
export async function main(
    webhookUrl: string = "https://app.windmill.dev/api/w/sbn-dev/jobs/run_wait_result/p/f/leads/submit_interest",
    scriptArgs = { "arg1": "first_name", "arg2": "last_name", "arg3": "email", "arg4": "phone" },
    token: string = "tvCyPtjhzjk389OVDFdXCIitgEhpCwbp",
) {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(scriptArgs),
    };
    const response = await fetch(webhookUrl, options);
    const data = await response.json();
    return data;
}
