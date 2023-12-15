// popup.js
document.addEventListener('DOMContentLoaded', function() {
  var historyList = document.getElementById('historyList');

  // Function to get favicon URL
  function getFaviconURL(url, callback) {
    chrome.tabs.query({ url: url }, function (tabs) {
      if (tabs && tabs.length > 0 && tabs[0].favIconUrl) {
        callback(tabs[0].favIconUrl);
      } else {
        // 如果没有 favicon，则显示默认图标
        callback('images/icon-16.png'); // 替换为你的默认图标路径
      }
    });
  }

  // 调用chrome.history.search方法
  chrome.history.search({ text: '', startTime: 0, endTime: Date.now(), maxResults: 100 }, function (historyItems) {
    // 将历史记录显示在history页面上
    historyItems.forEach(function (item) {
      var li = document.createElement('li');

      // 创建图标元素
      var icon = document.createElement('img');
      icon.className = 'favicon'; // 添加一个类名以便样式化
      li.appendChild(icon);

      //创建链接元素
      var link = document.createElement('a');
      link.textContent = item.title;
      link.href = item.url;
      link.target = '_blank'; // 在新标签页打开链接
      li.appendChild(link);

      // 显示URL
      var urlSpan = document.createElement('span');
      urlSpan.textContent = ' - ' + item.url;
      li.appendChild(urlSpan);

      // 获取页面的 favicon，并设置图标的 src 属性
      getFaviconURL(item.url, function (faviconUrl) {
        icon.src = faviconUrl;
        icon.width = 16;
        icon.height = 16;
      });

      historyList.appendChild(li);
    });
  });
});