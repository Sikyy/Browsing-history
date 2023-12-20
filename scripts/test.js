// 从 URL 中提取二级域名的函数
function extractDomain(url) {
    var match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
    return match ? match[1] : null;
}

// 测试 URL
var urls = [
    "https://www.google.com/search?q=example",
    "http://wiki.archlinux.org/wiki/Fcitx",
    "https://www.baidu.com/"
];

// 遍历测试
urls.forEach(function(url) {
    var domain = extractDomain(url);
    console.log("URL:", url, "\tDomain:", domain);
});
