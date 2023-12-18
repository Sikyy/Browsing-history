document.addEventListener('DOMContentLoaded', function () {
  var historyList = document.getElementById('historyList');

  // 在页面打开时，将 favicon 信息存储到本地存储中
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab && tab.favIconUrl) {
      var domain = extractDomain(tab.url);
      var faviconInfo = {
        faviconUrl: tab.favIconUrl
      };

      // 将 favicon 信息存储到本地存储中
      chrome.storage.local.set({ [domain]: faviconInfo });
    }
  });
});

// 在标签页更新时，也更新 favicon 信息
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.favIconUrl) {
    var domain = extractDomain(tab.url);
    var faviconInfo = {
      faviconUrl: tab.favIconUrl
    };

    // 将 favicon 信息存储到本地存储中
    chrome.storage.local.set({ [domain]: faviconInfo });
  }
});


  // 从本地存储中获取 favicon 信息
  function getFaviconInfo(url, callback) {
    var domain = extractDomain(url);

    chrome.storage.local.get([domain], function (result) {
      var faviconInfo = result[domain];
      if (faviconInfo) {
        callback(faviconInfo.faviconUrl);
      } else {
        callback(null); // 如果找不到 favicon 信息，返回 null 或其他默认值
      }
    });
  }


  // 从 URL 中提取二级域名的函数
  function extractDomain(url) {
    var match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
    return match ? match[1] : null;
  }

  // 更新历史记录的函数
  function updateHistory() {
    // 清空历史记录列表
    historyList.innerHTML = '';

    // 使用 chrome.history.search 方法获取历史记录
    chrome.history.search({ text: '', startTime: 0, endTime: Date.now(), maxResults: 100 }, function (historyItems) {
      // 遍历历史记录项并在页面上显示
      historyItems.forEach(function (item) {
        var li = document.createElement('li');

        // 创建图标元素
        var icon = document.createElement('img');
        icon.className = 'favicon'; // 添加一个类名以便样式化
        li.appendChild(icon);

        // 创建链接元素
        var link = document.createElement('a');
        link.textContent = item.title;
        link.href = item.url;
        link.target = '_blank'; // 在新标签页中打开链接
        li.appendChild(link);

        // 显示 URL
        var urlSpan = document.createElement('span');
        urlSpan.textContent = ' - ' + item.url;
        li.appendChild(urlSpan);

        // 获取页面的 favicon，并设置图标的 src 属性
        getFaviconInfo(item.url, function (faviconUrl) {
          icon.src = faviconUrl;
          icon.width = 16;
          icon.height = 16;
        });

        // 将当前历史记录项添加到历史记录列表
        historyList.appendChild(li);
      });
    });
  }

  // 监听标签页更新事件
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // 当标签页更新时，更新历史记录
    updateHistory();
  });

  // 初始化加载历史记录
  updateHistory();
});
