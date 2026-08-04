/**
 * Interact with Windmill's webhooks using standard fetch.
 *
 * @param webhookUrl {string} Webhook URL from Script Details page
 * @param scriptArgs {Object} JSON with arguments to pass
 * to the underlying script/flow
 * @param token {string} User token from User Settings page
 */
// export async function main(
//     webhookUrl: string = "https://app.windmill.dev/api...",
//     scriptArgs = { "arg1": "first name", "arg2": "last name", "arg3": "email", "arg4": "phone number" },
//     token: string = "supersecret",
// ) {
//     const options = {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(scriptArgs),
//     };
//     const response = await fetch(webhookUrl, options);
//     const data = await response.json();
//     return data;
// }


export async function main() {
    const jobTriggerResponse = await triggerJob();
    const data = await jobTriggerResponse.json();
    return data;
}

async function triggerJob() {
    const body = JSON.stringify({
        "email": "",
        "first_name": "",
        "last_name": "",
        "phone_number": ""
    });
    const endpoint = `https://app.windmill.dev/api/w/sbn-dev/jobs/run_wait_result/p/f/leads/submit_interest`;

    return await fetch(endpoint, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer <tvCyPtjhzjk389OVDFdXCIitgEhpCwbp>"
        },
        body
    });
}
