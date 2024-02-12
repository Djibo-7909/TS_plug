
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.text == "popup opened") {
        console.log ("Popup says it was opened.");
        // Run your script from here
        chrome.tabs.create({url: "/daliplot/templateA3.html"});
    }
});