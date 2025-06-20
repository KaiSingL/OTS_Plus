chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSettings",
    title: "Settings",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSettings") {
    chrome.runtime.openOptionsPage();
  }
});