// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // Execute the timer script on the current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['timer.js']
  });
});