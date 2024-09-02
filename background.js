const updateBlockedWebsites = async () => {
    const blockedWebsites = await new Promise((resolve) => {
      chrome.storage.local.get(['blockedWebsites'], (result) => {
        resolve(result.blockedWebsites || []);
      });
    });

    const existingRules = await new Promise((resolve) => {
        chrome.declarativeNetRequest.getDynamicRules((rules) => {
          resolve(rules);
        });
      });
      const existingRuleIds = existingRules.map(rule => rule.id);

      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRuleIds,
        }, resolve);
      });
  
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes(); // Time in minutes


    const rules = blockedWebsites.map((site, index) => {
      const isActiveDay = site.days.includes(currentDay);
      const isActiveTime = currentTime >= site.startTime && currentTime <= site.endTime;

      if (isActiveDay && isActiveTime) {
        return {
          id: index + 1,
          priority: 1,
          action: { type: "block" },
          condition: {
            requestDomains: [site.url],
            resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
          }
        };
      }
      return null; // If the rule is not active, return null
    })
    .filter(rule => rule !== null);

      await new Promise((resolve) => {
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules
        }, resolve);
      });

      const existingRules2 = await new Promise((resolve) => {
        chrome.declarativeNetRequest.getDynamicRules((rules) => {
          resolve(rules);
        });
      });
      console.log("existingRules2", existingRules2)
  };
  
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.blockedWebsites) {
      updateBlockedWebsites();
    }
  });
  
  // Run the update function every minute to check the time and update rules
  setInterval(updateBlockedWebsites, 60000); // 60000ms = 1 minute
  
  // Initialize on load
  updateBlockedWebsites();
  