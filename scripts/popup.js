document.addEventListener('DOMContentLoaded', function () {
  var historyList = document.getElementById('historyList');

// 在页面打开时，将 favicon 信息存储到本地存储中
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab && tab.url) {
      var domain = extractDomain(tab.url);

      // 使用 Google Favicon API 获取网站的 favicon
      var googleFaviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain;

      // 将 favicon 信息存储到本地存储中
      chrome.storage.local.set({ [domain]: { faviconUrl: googleFaviconUrl } });
    }
  });
});

// 在标签页更新时，也更新 favicon 信息
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    var domain = extractDomain(tab.url);

    // 使用 Google Favicon API 获取网站的 favicon
    var googleFaviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain;

    // 将 favicon 信息存储到本地存储中
    chrome.storage.local.set({ [domain]: { faviconUrl: googleFaviconUrl } });
  }
});

  //获取favicon的备用方法
  function getFavicon(url, successCallback, errorCallback) {
    // 创建一个虚拟的 a 标签用于解析 URL
    var a = document.createElement('a');
    a.href = url;

    // 获取域名
    var domain = extractDomain(url);

    // 方法1: 尝试直接访问 favicon.ico 文件
    var faviconIcoUrl = a.protocol + '//' + a.hostname + '/favicon.ico';
    tryLoadFavicon(faviconIcoUrl, successCallback, errorCallback);

    // 方法2: 尝试获取页面中的 <link> 标签中的 favicon
    var linkFaviconUrl = extractFavicon(url);
    tryLoadFavicon(linkFaviconUrl, successCallback, errorCallback);
}

  // 尝试加载 favicon
  function tryLoadFavicon(faviconUrl, successCallback, errorCallback) {
    var img = new Image();
    img.onload = function () {
        // 如果加载成功，调用 successCallback
        successCallback(faviconUrl);
    };
    img.onerror = function () {
        // 如果加载失败，调用 errorCallback
        errorCallback();
    };
    img.src = faviconUrl;
  }

  // 从页面中的 <link> 标签中提取 favicon 的路径
  function extractFavicon(url) {
    // 创建一个虚拟的 a 标签用于解析 URL
    var a = document.createElement('a');
    a.href = url;

    // 构建完整的 URL
    var baseUrl = a.protocol + '//' + a.hostname;

    // 获取页面上的所有 <link> 标签
    var links = document.querySelectorAll('link[rel~="icon"], link[rel~="shortcut icon"]');

    // 遍历 <link> 标签，提取 favicon 的路径
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = link.getAttribute('href');

        // 判断路径是否是相对路径，如果是，构建完整的 URL
        if (href && href.indexOf('http') !== 0) {
            href = baseUrl + '/' + href;
        }

        return href;
    }

    // 没有找到 favicon
    return null;
  }

  // 从本地存储中获取 favicon 信息
  function getFaviconInfo(url, callback) {
    var domain = extractDomain(url);

    chrome.storage.local.get([domain], function (result) {
      var faviconInfo = result[domain];
      if (faviconInfo) {
        callback(faviconInfo.faviconUrl);
      } else {
         // 如果找不到 favicon 信息，尝试使用备用方法获取
         getFavicon(url, function (faviconUrl) {
          if (faviconUrl) {
            // 如果备用方法获取成功，将新的 favicon 信息存储到本地存储中
            chrome.storage.local.set({ [domain]: { faviconUrl: faviconUrl } });
            callback(faviconUrl);
          } else {
            var dafulatFaviconUrl = 'images/icon-16.png'
            callback(dafulatFaviconUrl); // 如果备用方法也失败，返回 null 或其他默认值
          }
        });
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
        // var urlSpan = document.createElement('span');
        // urlSpan.textContent = ' - ' + item.url;
        // li.appendChild(urlSpan);

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
