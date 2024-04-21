chrome.action.setBadgeText({ text: "OFF" });
chrome.action.setBadgeBackgroundColor(
  { color: [255, 0, 0, 0] } // Green
);

const url = "https://candidature.1337.ma";
let i = 0;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith(url)) {
    
    chrome.tabs.sendMessage(tab.id, { id: tab.id });
  }
});


chrome.action.onClicked.addListener(async (tab) => {
  console.log("clicked");
  if (tab.url.startsWith(url)) {
    chrome.tabs.sendMessage(tab.id, {
      action: "STARTorSTOP",
    });
  }else{
    chrome.tabs.create({ url:url+"/meetings", active: true });
  }
});


// Receive message from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Set badge text for the current tab
  console.log("receving messages", message.badgeText);
 
  chrome.action.setBadgeText({ text: message.badgeText, tabId: message.tabId });
});
