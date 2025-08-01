// Create context menu item for right-click on extension action
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSettings",
    title: "Settings",
    contexts: ["action"]
  });
});

// Handle right-click context menu selection
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSettings") {
    chrome.runtime.openOptionsPage();
  }
});

// Handle left-click on extension action
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});