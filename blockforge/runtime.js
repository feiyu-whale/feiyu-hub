/* ============================================================
   积木工坊 · 生成页运行时 v1.3.0
   ------------------------------------------------------------
   这个文件的内容会被「内联」进导出的 HTML 里。
   它提供接口块真正能跑的实现：
   BF_API.sms(...) / BF_API.login(...) / BF_API.upload(...) …
   全部默认模拟模式，填了地址+密钥才走真接口。
   ============================================================ */

const BF_RUNTIME = `

/* ---------- 通用工具 ---------- */
var BFR = {
  /* 安全转义 */
  esc: function (v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /* 本地存储读写 */
  get: function (k, d) {
    try {
      var v = localStorage.getItem('bfr.' + k);
      return v === null ? d : JSON.parse(v);
    } catch (e) { return d; }
  },
  set: function (k, v) {
    try { localStorage.setItem('bfr.' + k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  },

  /* 随机码 */
  code: function (len) {
    var s = '';
    for (var i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  },

  /* 简单哈希（只用于本地比对，不是密码学安全） */
  hash: function (s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  },

  /* 弹一条提示 */
  toast: function (msg, type) {
    var el = document.getElementById('bfrToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'bfrToast';
      el.className = 'bfr-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'bfr-toast show' + (type ? ' ' + type : '');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'bfr-toast'; }, 2200);
  },

  /* 真调用（填了地址才走） */
  request: function (opt, cb) {
    if (!opt.endpoint) { cb({ ok: false, error: '没有配置接口地址' }); return; }
    var xhr = new XMLHttpRequest();
    xhr.open(opt.method || 'POST', opt.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (opt.key) xhr.setRequestHeader('Authorization', 'Bearer ' + opt.key);
    xhr.onload = function () {
      var data;
      try { data = JSON.parse(xhr.responseText); }
      catch (e) { data = { raw: xhr.responseText }; }
      cb({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: data });
    };
    xhr.onerror = function () { cb({ ok: false, error: '网络不通' }); };
    xhr.send(JSON.stringify(opt.body || {}));
  }
};

/* ---------- 接口实现 ---------- */
var BF_API = {

  /* 短信验证码 */
  sms: function (cfg, onSend) {
    var len = Number(cfg.len) || 6;
    var ttl = (Number(cfg.ttl) || 300) * 1000;
    var mock = !cfg.endpoint;
    return {
      send: function (phone) {
        if (!/^1[3-9]\\d{9}$/.test(String(phone || ''))) {
          BFR.toast('手机号格式不对', 'err');
          return false;
        }
        var rec = { code: BFR.code(len), phone: phone, at: Date.now(), exp: Date.now() + ttl, used: false };
        BFR.set('sms.' + phone, rec);
        if (mock) {
          BFR.toast('【模拟】验证码：' + rec.code, 'ok');
          if (onSend) onSend(rec.code, true);
        } else {
          BFR.request({
            endpoint: cfg.endpoint, key: cfg.key, method: 'POST',
            body: { phone: phone, code: rec.code }
          }, function (r) {
            if (r.ok) BFR.toast('已发送', 'ok');
            else BFR.toast('发送失败：' + (r.error || r.status), 'err');
            if (onSend) onSend(rec.code, r.ok);
          });
        }
        return true;
      },
      verify: function (phone, input) {
        var rec = BFR.get('sms.' + phone, null);
        if (!rec) return { ok: false, why: '没发过验证码' };
        if (rec.used) return { ok: false, why: '验证码已用过' };
        if (Date.now() > rec.exp) return { ok: false, why: '验证码已过期' };
        if (String(input) !== String(rec.code)) return { ok: false, why: '验证码不对' };
        rec.used = true;
        BFR.set('sms.' + phone, rec);
        return { ok: true };
      }
    };
  },

  /* 邮箱验证码 */
  email: function (cfg, onSend) {
    var len = Number(cfg.len) || 6;
    var ttl = (Number(cfg.ttl) || 600) * 1000;
    var mock = !cfg.endpoint;
    return {
      send: function (mail) {
        if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(String(mail || ''))) {
          BFR.toast('邮箱格式不对', 'err');
          return false;
        }
        var rec = { code: BFR.code(len), mail: mail, exp: Date.now() + ttl, used: false };
        BFR.set('mail.' + mail, rec);
        if (mock) {
          BFR.toast('【模拟】验证码：' + rec.code, 'ok');
          if (onSend) onSend(rec.code, true);
        } else {
          BFR.request({
            endpoint: cfg.endpoint, key: cfg.key, method: 'POST',
            body: { mail: mail, code: rec.code }
          }, function (r) {
            if (r.ok) BFR.toast('已发送', 'ok');
            else BFR.toast('发送失败', 'err');
            if (onSend) onSend(rec.code, r.ok);
          });
        }
        return true;
      },
      verify: function (mail, input) {
        var rec = BFR.get('mail.' + mail, null);
        if (!rec) return { ok: false, why: '没发过验证码' };
        if (rec.used) return { ok: false, why: '已用过' };
        if (Date.now() > rec.exp) return { ok: false, why: '已过期' };
        if (String(input) !== String(rec.code)) return { ok: false, why: '不对' };
        rec.used = true;
        BFR.set('mail.' + mail, rec);
        return { ok: true };
      }
    };
  },

  /* 图形验证码（纯前端画布生成） */
  captcha: function (type) {
    var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return {
      code: code,
      draw: function (canvas) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#101a2e';
        ctx.fillRect(0, 0, w, h);
        for (var i = 0; i < 60; i++) {
          ctx.fillStyle = 'rgba(34,211,238,' + (Math.random() * 0.3) + ')';
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
        for (var j = 0; j < 3; j++) {
          ctx.strokeStyle = 'rgba(167,139,250,.4)';
          ctx.beginPath();
          ctx.moveTo(Math.random() * w, Math.random() * h);
          ctx.lineTo(Math.random() * w, Math.random() * h);
          ctx.stroke();
        }
        for (var k = 0; k < code.length; k++) {
          ctx.save();
          ctx.translate(18 + k * 22, h / 2 + 8);
          ctx.rotate((Math.random() - 0.5) * 0.5);
          ctx.font = 'bold 22px monospace';
          ctx.fillStyle = ['#22d3ee', '#4ade80', '#fbbf24'][k % 3];
          ctx.fillText(code[k], 0, 0);
          ctx.restore();
        }
      },
      verify: function (input) {
        return String(input || '').toUpperCase() === code;
      }
    };
  },

  /* 登录注册 */
  account: function (cfg) {
    var list = function () { return BFR.get('users', []); };
    var save = function (arr) { BFR.set('users', arr); };
    return {
      register: function (u, p) {
        if (!u || !p) return { ok: false, why: '账号密码不能空' };
        var arr = list();
        if (arr.some(function (x) { return x.u === u; })) return { ok: false, why: '账号已存在' };
        arr.push({ u: u, h: BFR.hash(p), at: Date.now() });
        save(arr);
        return { ok: true };
      },
      login: function (u, p) {
        var arr = list();
        var f = arr.find(function (x) { return x.u === u; });
        if (!f) return { ok: false, why: '账号不存在' };
        if (f.h !== BFR.hash(p)) return { ok: false, why: '密码不对' };
        var sess = { u: u, at: Date.now(), token: BFR.hash(u + Date.now()) };
        if (cfg && cfg.remember !== false) BFR.set('session', sess);
        else sessionStorage.setItem('bfr.session', JSON.stringify(sess));
        return { ok: true, session: sess };
      },
      current: function () {
        return BFR.get('session', null) ||
          (function () { try { return JSON.parse(sessionStorage.getItem('bfr.session')); } catch (e) { return null; } })();
      },
      logout: function () {
        localStorage.removeItem('bfr.session');
        sessionStorage.removeItem('bfr.session');
      }
    };
  },

  /* 文件上传 */
  upload: function (cfg, onPick) {
    var maxBytes = (Number(cfg.maxmb) || 10) * 1024 * 1024;
    return function (input) {
      var files = Array.prototype.slice.call(input.files || []);
      if (!cfg.multiple && files.length > 1) files = files.slice(0, 1);
      var out = [];
      files.forEach(function (f) {
        if (f.size > maxBytes) {
          BFR.toast(f.name + ' 超过 ' + cfg.maxmb + 'MB', 'err');
          return;
        }
        if (!cfg.endpoint) {
          var reader = new FileReader();
          reader.onload = function (e) {
            out.push({ name: f.name, size: f.size, type: f.type, data: e.target.result });
            if (onPick) onPick(out);
          };
          reader.readAsDataURL(f);
        } else {
          var fd = new FormData();
          fd.append('file', f);
          var xhr = new XMLHttpRequest();
          xhr.open('POST', cfg.endpoint, true);
          if (cfg.key) xhr.setRequestHeader('Authorization', 'Bearer ' + cfg.key);
          xhr.onload = function () {
            out.push({ name: f.name, size: f.size, resp: xhr.responseText });
            if (onPick) onPick(out);
          };
          xhr.send(fd);
        }
      });
      return true;
    };
  },

  /* 图片压缩 */
  compress: function (file, quality, cb) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob(function (blob) {
        URL.revokeObjectURL(url);
        cb(blob, { before: file.size, after: blob.size });
      }, 'image/jpeg', Number(quality) || 0.8);
    };
    img.src = url;
  },

  /* 搜索 + 分页 */
  search: function (rows, kw, fields) {
    if (!kw) return rows.slice();
    var k = String(kw).toLowerCase();
    var fs = String(fields || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return rows.filter(function (r) {
      return fs.some(function (f) {
        return String(r[f] === undefined ? '' : r[f]).toLowerCase().indexOf(k) > -1;
      });
    });
  },
  page: function (rows, size, cur) {
    var s = Number(size) || 10;
    var c = Math.max(1, Number(cur) || 1);
    var total = Math.ceil(rows.length / s);
    return {
      rows: rows.slice((c - 1) * s, c * s),
      total: total, cur: c, size: s, count: rows.length
    };
  },

  /* 导出 */
  download: function (rows, format, name) {
    var txt, mime, ext;
    if (format === 'JSON') {
      txt = JSON.stringify(rows, null, 2); mime = 'application/json'; ext = 'json';
    } else {
      var cols = rows.length ? Object.keys(rows[0]) : [];
      txt = cols.join(',') + '\\n' + rows.map(function (r) {
        return cols.map(function (c) { return '"' + String(r[c] === undefined ? '' : r[c]).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\\n');
      mime = 'text/csv;charset=utf-8'; ext = format === 'Excel(xls)' ? 'xls' : 'csv';
      txt = '\\uFEFF' + txt;
    }
    var blob = new Blob([txt], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (name || 'export') + '.' + ext;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  },

  /* 语音朗读 */
  speak: function (text, rate, pitch) {
    if (!window.speechSynthesis) { BFR.toast('浏览器不支持朗读', 'err'); return; }
    var u = new SpeechSynthesisUtterance(String(text || ''));
    u.rate = Number(rate) || 1;
    u.pitch = Number(pitch) || 1;
    u.lang = 'zh-CN';
    speechSynthesis.speak(u);
  },

  /* 距离计算（Haversine） */
  distance: function (lat1, lon1, lat2, lon2, unit) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return unit === '米' ? Math.round(d * 1000) : Math.round(d * 100) / 100;
  },

  /* 支付下单（虚拟） */
  pay: function (cfg) {
    return {
      create: function (amount, orderId) {
        var rec = {
          id: orderId || ('P' + Date.now().toString(36).toUpperCase()),
          amount: Number(amount) || 0,
          currency: cfg && cfg.currency || '虚拟点',
          status: 'paid',
          at: Date.now()
        };
        var arr = BFR.get('pays', []);
        arr.unshift(rec);
        BFR.set('pays', arr);
        BFR.toast('支付成功 ' + rec.amount + ' ' + rec.currency, 'ok');
        return rec;
      },
      list: function () { return BFR.get('pays', []); }
    };
  },

  /* 退款 */
  refund: function (cfg) {
    return {
      byOrder: function (orderId, reason) {
        if (cfg && cfg.reason && !reason) return { ok: false, why: '必须填退款原因' };
        var arr = BFR.get('pays', []);
        var f = arr.find(function (x) { return x.id === orderId; });
        if (!f) return { ok: false, why: '找不到这笔单' };
        if (f.status === 'refunded') return { ok: false, why: '已经退过了' };
        f.status = 'refunded';
        f.reason = reason || '';
        BFR.set('pays', arr);
        BFR.log('系统', '退款 ' + orderId + '：' + (reason || ''));
        return { ok: true, order: f };
      }
    };
  },

  /* 订单（状态流转 + 查询） */
  order: function (table) {
    var tbl = table || 'data';
    return {
      all: function () { return BFR.get('tbl.' + tbl, []); },
      save: function (rows) { BFR.set('tbl.' + tbl, rows); },
      add: function (obj) {
        var rows = this.all();
        obj.id = obj.id || ('O' + Date.now().toString(36).toUpperCase());
        obj.at = Date.now();
        rows.unshift(obj);
        this.save(rows);
        return obj;
      },
      query: function (opt) {
        var rows = this.all();
        opt = opt || {};
        if (opt.id) rows = rows.filter(function (r) { return r.id === opt.id; });
        if (opt.status) rows = rows.filter(function (r) { return r.status === opt.status; });
        if (opt.from) rows = rows.filter(function (r) { return r.at >= opt.from; });
        if (opt.to) rows = rows.filter(function (r) { return r.at <= opt.to; });
        return rows;
      }
    };
  },

  /* 优惠券 */
  coupon: function (cfg) {
    var kind = cfg && cfg.kind || '满减';
    return {
      create: function (title, value, min) {
        var arr = BFR.get('coupons', []);
        var c = { code: 'C' + Math.random().toString(36).slice(2, 8).toUpperCase(), title: title, kind: kind, value: Number(value) || 0, min: Number(min) || 0, used: false };
        arr.push(c);
        BFR.set('coupons', arr);
        return c;
      },
      list: function () { return BFR.get('coupons', []); },
      verify: function (code) {
        var arr = BFR.get('coupons', []);
        var f = arr.find(function (x) { return x.code === String(code).toUpperCase(); });
        if (!f) return { ok: false, why: '券不存在' };
        if (f.used) return { ok: false, why: '券已使用' };
        return { ok: true, coupon: f };
      },
      use: function (code, amount) {
        var v = this.verify(code);
        if (!v.ok) return v;
        if (amount < v.coupon.min) return { ok: false, why: '没达到使用门槛' };
        var arr = BFR.get('coupons', []);
        var f = arr.find(function (x) { return x.code === String(code).toUpperCase(); });
        f.used = true;
        BFR.set('coupons', arr);
        var off = f.kind === '折扣' ? amount * (1 - f.value) : f.value;
        return { ok: true, off: Math.round(off * 100) / 100 };
      }
    };
  },

  /* 站内消息 */
  push: function (cfg) {
    var keep = Number(cfg && cfg.keep) || 30;
    return {
      send: function (to, title, body) {
        var arr = BFR.get('msgs', []);
        arr.unshift({ to: to || 'all', title: title, body: body, at: Date.now(), read: false });
        BFR.set('msgs', arr.slice(0, keep * 20));
        return true;
      },
      list: function (to) {
        return BFR.get('msgs', []).filter(function (m) { return !to || m.to === to || m.to === 'all'; });
      },
      read: function (idx) {
        var arr = BFR.get('msgs', []);
        if (arr[idx]) { arr[idx].read = true; BFR.set('msgs', arr); }
      },
      unread: function (to) {
        return this.list(to).filter(function (m) { return !m.read; }).length;
      }
    };
  },

  /* 地图选点（模拟） */
  map: function (cfg) {
    var city = cfg && cfg.city || '杭州';
    return {
      pick: function (lat, lng) {
        return { city: city, lat: Number(lat) || 30.27, lng: Number(lng) || 120.15 };
      },
      address: function (lat, lng) {
        return city + ' 附近（' + Number(lat).toFixed(3) + ', ' + Number(lng).toFixed(3) + '）';
      }
    };
  },

  /* 缓存 */
  cache: function (ttl) {
    var ms = (Number(ttl) || 60) * 1000;
    return {
      get: function (k) {
        var c = BFR.get('cache.' + k, null);
        if (!c) return null;
        if (Date.now() - c.at > ms) return null;
        return c.v;
      },
      set: function (k, v) { BFR.set('cache.' + k, { v: v, at: Date.now() }); return v; }
    };
  },

  /* 操作日志 */
  log: function (who, act, keep) {
    var arr = BFR.get('logs', []);
    arr.unshift({ who: who, act: act, at: new Date().toISOString() });
    var k = Number(keep) || 200;
    if (arr.length > k) arr = arr.slice(0, k);
    BFR.set('logs', arr);
    return arr;
  }
};
`;

/* 把运行时拼进导出结果 */
function bfRuntimeCode() {
  return BF_RUNTIME + `
/* ---------- 生成页的接口块绑定 ---------- */
var __apiDefs = ${JSON.stringify((typeof BF_API_BLOCKS !== 'undefined' ? BF_API_BLOCKS : []).map(b => ({ id: b.id, name: b.name })), null, 0)};
`;
}
