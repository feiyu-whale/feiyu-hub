/* 游戏区 开屏 · 550C 启动动画
   干什么：播 550C 完整档开机动画（逐笔写 logo → 终端覆写全流程），放完写入会话标记并跳首页
   用了什么：
     · dsh-550c-boot (MIT, © Ziyang Song / 原稿 Voidpocket) —— lib/550c.css + lib/550c-show.js
   输入：无
   输出：写 sessionStorage['feiyuEntered_games'] 后 location.href = '../index.html'
   版本：v1.0-游戏区550C开屏 20261106
*/
(function () {
  // 完整档是桌面栅格（三栏 + 弹窗），窄屏塞不下、按钮还会被裁掉；
  // 手机上自动降级成简易档（只逐笔写 logo），干净且认得出。
  var MODE = (window.innerWidth < 900 || window.innerHeight < 500) ? 'simple' : 'full';

  // 配色：?scheme=green|cyan|white 可切；不写就是琥珀（原作者配色，默认）
  var SCHEMES = ['amber', 'green', 'cyan', 'white'];
  var scheme = new URLSearchParams(location.search).get('scheme') || 'amber';
  if (SCHEMES.indexOf(scheme) >= 0 && scheme !== 'amber') {
    document.documentElement.setAttribute('data-scheme', scheme);
  }

  function enter() {
    try { sessionStorage.setItem('feiyuEntered_games', '1'); } catch (e) {}
    location.href = '../index.html';
  }

  function boot() {
    // 桌面端按 Esc 可跳过
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') enter();
    });

    // 插件原本跑在 shadow root 里；普通 DOM 下必须给 createShow 一个容器，
    // 直接传 document 会因为「document 只允许一个根元素」在 fallback 窗口处报错。
    var stage = document.getElementById('stage-root') || document.body;
    var show = window.createShow(stage, { mode: MODE, cancelled: 'CANCELLED' });
    show.start().then(function () {
      // 动画自然放完 → 停一下让人看清最后一幕，再进首页
      setTimeout(enter, 900);
    }, function () {
      // 被跳过
      enter();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
