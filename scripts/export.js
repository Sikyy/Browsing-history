document.addEventListener('DOMContentLoaded', function () {
    // 在 DOMContentLoaded 事件处理器内执行脚本
    document.getElementById('exportButton').addEventListener('click', function () {
      // 当点击导出按钮时，跳转到 export.html
      window.open('export.html', '_blank');
    });
  });
  