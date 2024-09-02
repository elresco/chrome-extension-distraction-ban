const daysMap = {
    0: "Lun",
    1: "Mar",
    2: "Mie",
    3: "Jue",
    4: "Vie",
    5: "Sa",
    6: "Do",
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('block-form');
    const blockedWebsitesUl = document.getElementById('blocked-websites');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const url = document.getElementById('url').value;
      const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(checkbox => parseInt(checkbox.value));
      const startTime = document.getElementById('startTime').value.split(':');
      const endTime = document.getElementById('endTime').value.split(':');
  
      const startTimeMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
      const endTimeMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
  
      const newWebsite = {
        url,
        days,
        startTime: startTimeMinutes,
        endTime: endTimeMinutes
      };
  
      const blockedWebsites = await new Promise((resolve) => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
          resolve(result.blockedWebsites || []);
        });
      });
  
      blockedWebsites.push(newWebsite);
  
      chrome.storage.local.set({ blockedWebsites }, () => {
        renderBlockedWebsites();
      });
    });
  
    const renderBlockedWebsites = async () => {
      const blockedWebsites = await new Promise((resolve) => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
          resolve(result.blockedWebsites || []);
        });
      });
  
      blockedWebsitesUl.innerHTML = ''; // Clear the list
  
      blockedWebsites.forEach((site, index) => {
        const daysFormat = site.days.map(x => daysMap[x])
        const siteLi = document.createElement('li');
        siteLi.innerHTML = `
          <strong>${site.url}</strong><br/>
          ${daysFormat.join(', ')}<br/>
          ${formatTime(site.startTime)} to ${formatTime(site.endTime)}<br/>
          <button data-index="${index}" class="delete-btn">Delete</button>
        `;
        blockedWebsitesUl.appendChild(siteLi);
      });
  
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
          const index = e.target.dataset.index;
  
          blockedWebsites.splice(index, 1);
  
          chrome.storage.local.set({ blockedWebsites }, () => {
            renderBlockedWebsites();
          });
        });
      });
    };
  
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
      const mins = (minutes % 60).toString().padStart(2, '0');
      return `${hours}:${mins}`;
    };
  
    renderBlockedWebsites();
  });
  