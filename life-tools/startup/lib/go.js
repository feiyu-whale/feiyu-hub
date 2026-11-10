/* 生活工具箱 开屏 · 跳转逻辑
   干什么：收到 mist:enter 事件后跳到 生活工具箱 首页
   输入：Mist 组件派的 mist:enter 事件
   输出：location.href = ../index.html
*/
window.addEventListener('mist:enter', function () {
  try { sessionStorage.setItem('feiyuEntered_life-tools', '1'); } catch (e) {}
  window.mistSplashStop?.();
  location.href = '../index.html';
}, { once: true });
