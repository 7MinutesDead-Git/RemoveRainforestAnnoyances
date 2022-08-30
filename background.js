// Since injected functions with chrome content scripts are a copy, not a reference,
// trying to access any functions or variables out of this scope wouldn't work.
// So everything will go inside removeAmazonAds().
async function removeAmazonAds() {
    // -----------------------------------------------------
    function verifyAdDeletion() {
        if (adCount !== deleted) {
            console.error("🔥🐠 The ad count doesn't match how many were deleted. 🐠🔥", elementsToDelete)
        }
        else {
            console.log(`✨🐠 Deleted ${deleted} ads. 🐠✨`)
        }
    }
    // -----------------------------------------------------
    function deleteAds() {
        try {
            if (elementsToDelete.length > 0) {
                for (const ad of elementsToDelete) {
                    ad.remove()
                    deleted++
                }
            }
            else {
                console.log("✨🐠 Didn't see any ads. Nice. 🐠✨")
            }
        }
        catch (err) {
            console.error("🔥🐠 Caught this error from Remove Rainforest Sponsored Results: ", err)
        }
    }
    // -----------------------------------------------------
    // The divs generated as ads in amazon searches seem to all contain a css class named AdHolder.
    // The top level banner ad seems to always be a div with an id of "percolate-ui-ilm_div".
    // This will need refactoring if these identifiers are ever changed.
    const elementsToDelete = []
    elementsToDelete.push(
        ...document.querySelectorAll('.AdHolder'),
        ...document.querySelectorAll('div#percolate-ui-ilm_div')
    )
    const adCount = elementsToDelete.length
    let deleted = 0
    deleteAds()
    verifyAdDeletion()
}

// Injects removeAmazonAds into targeted tab.
async function injectScript(tab) {
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: removeAmazonAds,
        args: [],
    });
}

// -------------------------------------------------------------
// Covers active tab.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        console.log(`tab: ${tab.id}`, tab)
        await injectScript(tab)
    }
})

// -------------------------------------------------------------
// Covers newly created tabs that aren't in focus.
chrome.tabs.onCreated.addListener(async (tab) => {
    console.log(`new tab: ${tab.id}`, tab)
    await injectScript(tab)
})