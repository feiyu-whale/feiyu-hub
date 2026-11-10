/* 历法区开屏 · 跳转逻辑
   干什么：收到 mist:enter 事件（用户点「进入」）后跳到历法区首页
   输入：Mist 组件派的 mist:enter 事件
   输出：location.href = ../index.html
*/
window.addEventListener('mist:enter', function () {
  // 记一下，同一标签页不必每次进都看开屏
  try { sessionStorage.setItem('feiyuEntered_calendar', '1'); } catch (e) {}
  window.mistSplashStop?.();
  location.href = '../index.html';
}, { once: true });
