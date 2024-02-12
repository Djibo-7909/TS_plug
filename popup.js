
// Initialize background page
/*chrome.runtime.getBackgroundPage(function(backgroundPage) {
    console = backgroundPage.console;
  })*/


  chrome.runtime.sendMessage({text: "popup opened"});