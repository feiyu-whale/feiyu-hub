/* ============================================================
   云巢电竞 · 公共逻辑 v2.0
   ============================================================ */

/* ============================================================
   安全工具（2026-10-26 加）
   前端能做的防护都在这儿：输出转义、输入清洗、长度限制
   ============================================================ */

const YCSec = {
  /* HTML 转义：把用户输入的 < > & " ' 全换成实体，
     防止拼进 innerHTML 时被当成标签执行（XSS） */
  esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /* 属性值转义（放进 title=""、data-*="" 时用） */
  escAttr(v) {
    return this.esc(v).replace(/`/g, '&#96;');
  },

  /* 输入清洗：去控制字符、去首尾空白、限长 */
  clean(v, maxLen) {
    if (v === null || v === undefined) return '';
    let s = String(v)
      .replace(/[\u0000-\u001F\u007F]/g, '')   // 控制字符
      .replace(/[\u200B-\u200D\uFEFF]/g, '');  // 零宽字符
    s = s.trim();
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  },

  /* 手机号校验 */
  isPhone(v) {
    return /^1[3-9]\d{9}$/.test(String(v || '').trim());
  },

  /* 数字白名单校验（防止 NaN / Infinity / 负数混进金额） */
  isAmount(v) {
    return typeof v === 'number' && isFinite(v) && v >= 0;
  },

  /* 只允许安全协议的 URL */
  safeUrl(u) {
    const s = String(u || '').trim();
    if (/^https?:\/\//i.test(s) || /^[\w.\-]+\.html/i.test(s)) return s;
    return '#';
  }
};

const YCApp = {
  state: null,

  init() {
    // 只有第一次才从 localStorage 读；之后复用同一个引用
    if (!this.state) this.state = YCStore.load();
    this.renderRoleBar();
    this.renderWallet();
    return this.state;
  },

  save() {
    YCStore.save(this.state);
    this.renderWallet();
  },

  /* ---------- 角色切换 ---------- */
  renderRoleBar() {
    const bar = document.getElementById('rolebar');
    if (!bar) return;
    const roles = [
      { k: 'boss',   n: '👤 老板' },
      { k: 'worker', n: '🎮 打手' },
      { k: 'admin',  n: '🛡️ 管理员' }
    ];
    bar.innerHTML = roles.map(r =>
      `<button class="${this.state.role === r.k ? 'on' : ''}" data-role="${r.k}">${r.n}</button>`
    ).join('');
    bar.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        this.state.role = b.dataset.role;
        this.save();
        location.reload();
      };
    });
  },

  /* ---------- 钱包 ---------- */
  renderWallet() {
    const el = document.getElementById('wallet');
    if (!el) return;
    if (this.state.role === 'boss') {
      el.innerHTML = `🍚 <b>${Number(this.state.baofan).toLocaleString('zh-CN')}</b>`;
      el.onclick = () => location.href = 'wallet.html';
    } else if (this.state.role === 'worker') {
      el.innerHTML = `⭐ <b>${YCUtil.creditOf(this.state, this.state.workerId)}</b>`;
      el.onclick = () => location.href = 'me.html';
    } else {
      el.innerHTML = `🛡️ <b>管理</b>`;
    }
    el.style.cursor = 'pointer';
  },

  /* ---------- 提示 ---------- */
  toast(msg, isErr) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const d = document.createElement('div');
    d.className = 'toast' + (isErr ? ' err' : '');
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2200);
  },

  /* ---------- 底部五 Tab 导航 ---------- */
  renderTabbar(active) {
    const el = document.getElementById('tabbar');
    if (!el) return;
    const role = this.state.role;
    let items;

    if (role === 'boss') {
      items = [
        { k: 'index',   i: '🏠', n: '首页',  href: 'index.html' },
        { k: 'category',i: '🗂️', n: '分类',  href: 'category.html' },
        { k: 'message', i: '💬', n: '消息',  href: 'messages.html' },
        { k: 'orders',  i: '📋', n: '订单',  href: 'orders.html' },
        { k: 'me',      i: '👤', n: '我的',  href: 'me.html' }
      ];
    } else if (role === 'worker') {
      items = [
        { k: 'worker',  i: '🎮', n: '接单台', href: 'worker.html' },
        { k: 'orders',  i: '📋', n: '订单',   href: 'orders.html' },
        { k: 'message', i: '💬', n: '消息',   href: 'messages.html' },
        { k: 'me',      i: '👤', n: '我的',   href: 'me.html' }
      ];
    } else {
      items = [
        { k: 'admin',   i: '🛡️', n: '后台',  href: 'admin.html' },
        { k: 'orders',  i: '📋', n: '订单',  href: 'orders.html' },
        { k: 'me',      i: '👤', n: '我的',  href: 'me.html' }
      ];
    }

    el.innerHTML = items.map(x =>
      `<a href="${x.href}" class="${active === x.k ? 'on' : ''}">
         <span class="ti">${x.i}</span>${x.n}
       </a>`
    ).join('');
  },

  /* ---------- 权限守卫 ---------- */
  guard(allow) {
    if (!allow.includes(this.state.role)) {
      document.body.innerHTML =
        `<div class="empty" style="padding-top:120px">
           <span class="icon">🚫</span>当前身份无法访问此页面<br><br>
           <a href="index.html" class="btn" style="display:inline-block;margin-top:10px">回到首页</a>
         </div>`;
      return false;
    }
    return true;
  },

  /* ---------- 弹层 ---------- */
  modal(title, bodyHtml, actions) {
    const mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = `<div class="modal">
      <h3>${title}</h3>
      ${bodyHtml}
      <div class="modal-foot"></div>
    </div>`;
    const foot = mask.querySelector('.modal-foot');
    (actions || [{ t: '关闭', cls: 'btn-ghost' }]).forEach(a => {
      const b = document.createElement('button');
      b.className = a.cls || 'btn';
      b.textContent = a.t;
      b.onclick = () => {
        if (a.fn && a.fn() === false) return;
        mask.remove();
      };
      foot.appendChild(b);
    });
    mask.onclick = e => { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
    return mask;
  },

  /* ---------- 登录守卫 ---------- */
  requireLogin() {
    if (localStorage.getItem('yunchao_logged') !== '1') {
      location.replace('login.html');
      return false;
    }
    return true;
  }
};

/* ---------- 页面初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // 演示横幅
  if (!document.querySelector('.demo-banner')) {
    const b = document.createElement('div');
    b.className = 'demo-banner';
    b.textContent = '演示系统 · 无真实交易 · 白饭为虚拟积分，不可充值/提现/转让';
    document.body.insertBefore(b, document.body.firstChild);
  }

  // 登录守卫（login.html 自己不带 data-nologin）
  if (document.body.dataset.nologin === undefined) {
    if (!YCApp.requireLogin()) return;
  }

  YCApp.init();
  if (document.getElementById('tabbar')) {
    YCApp.renderTabbar(document.body.dataset.tab || '');
  }
});

window.YCSec = YCSec;
window.YCApp = YCApp;
