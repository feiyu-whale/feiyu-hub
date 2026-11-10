/* ============================================================
   积木工坊 · 导出器 v1.0.0
   把画布上的块 + 连线，编译成一个能独立打开的 HTML
   ============================================================ */

/* 从连线推断每个块的上下游 */
function bfGraph() {
  const out = {};   // nodeUid -> 下游节点列表
  const inn = {};   // nodeUid -> 上游节点列表
  BF.nodes.forEach(n => { out[n.uid] = []; inn[n.uid] = []; });
  BF.links.forEach(l => {
    if (out[l.from.node]) out[l.from.node].push(l.to.node);
    if (inn[l.to.node]) inn[l.to.node].push(l.from.node);
  });
  return { out, inn };
}

/* 按连线顺序给块排序（拓扑），保证生成代码时数据源在前 */
function bfTopoOrder() {
  const { out, inn } = bfGraph();
  const indeg = {};
  BF.nodes.forEach(n => { indeg[n.uid] = (inn[n.uid] || []).length; });
  const q = BF.nodes.filter(n => indeg[n.uid] === 0).map(n => n.uid);
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    (out[u] || []).forEach(v => {
      indeg[v]--;
      if (indeg[v] === 0) q.push(v);
    });
  }
  // 有环就把剩下的按原顺序补上
  BF.nodes.forEach(n => { if (order.indexOf(n.uid) === -1) order.push(n.uid); });
  return order;
}

function bfNodeCfg(uid) {
  const n = BF.nodes.find(x => x.uid === uid);
  return n ? { node: n, cfg: n.cfg, def: bfBlockDef(n.blockId) } : null;
}

/* 找到某块的数据来源（上游 ds.* 块的表名） */
function bfSourceTable(uid) {
  const { inn } = bfGraph();
  const ups = inn[uid] || [];
  for (const u of ups) {
    const info = bfNodeCfg(u);
    if (!info) continue;
    if (info.def.id === 'ds.items') return info.cfg.table || 'data';
    if (info.def.id === 'ds.fields' || info.def.id === 'lg.flow') {
      const deeper = bfSourceTable(u);
      if (deeper) return deeper;
    }
  }
  return null;
}

/* ---------- 生成各个块的运行时代码 ---------- */
function bfGenNodes(order) {
  const jsParts = [];
  const htmlParts = [];
  const seenTable = {};

  order.forEach(uid => {
    const info = bfNodeCfg(uid);
    if (!info) return;
    const { node, cfg, def } = info;

    switch (def.id) {

      case 'ds.items': {
        const t = cfg.table || 'data';
        if (seenTable[t]) break;
        seenTable[t] = true;
        let seed = [];
        try { seed = JSON.parse(cfg.seed || '[]'); } catch (e) { seed = []; }
        jsParts.push(`DB['${t}'] = ${JSON.stringify(seed)};`);
        break;
      }

      case 'ds.fields': {
        // 字段定义只影响渲染，不必生成代码
        break;
      }

      case 'ui.nav': {
        const items = String(cfg.items || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        htmlParts.unshift(`<nav class="nav"><b>${bfEsc(cfg.brand || '我的系统')}</b>
          <div>${items.map(i => `<a href="#">${bfEsc(i)}</a>`).join('')}</div></nav>`);
        break;
      }

      case 'ui.stat': {
        const t = bfSourceTable(uid) || 'data';
        const label = cfg.label || '总数';
        const metric = cfg.metric || 'count';
        jsParts.push(`
          (function(){
            var rows = DB['${t}'] || [];
            var v = rows.length;
            if ('${metric}' === 'sum' || '${metric}' === 'amount') {
              v = rows.reduce(function(s,r){ return s + (Number(r.amount)||0); }, 0);
            }
            var el = document.createElement('div');
            el.className = 'stat';
            el.innerHTML = '<b>' + v + '</b><span>${bfEscJS(label)}</span>';
            mount.appendChild(el);
          })();`);
        break;
      }

      case 'ui.list': {
        const t = bfSourceTable(uid) || 'data';
        const cols = String(cfg.fields || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const title = cfg.title || '列表';
        const search = cfg.search ? 'true' : 'false';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>${bfEscJS(title)}</h3>' +
              (${search} ? '<input class="search" placeholder="搜索…">' : '') +
              '<div class="rows"></div>';
            mount.appendChild(wrap);
            var rowsBox = wrap.querySelector('.rows');
            function draw(kw) {
              var rows = (DB['${t}'] || []).slice();
              if (kw) rows = rows.filter(function(r){
                return JSON.stringify(r).toLowerCase().indexOf(kw.toLowerCase()) > -1;
              });
              if (!rows.length) { rowsBox.innerHTML = '<p class="empty">暂无数据</p>'; return; }
              var html = '<table><thead><tr>' +
                ${JSON.stringify(cols)}.map(function(c){ return '<th>' + esc(c) + '</th>'; }).join('') +
                '</tr></thead><tbody>';
              rows.forEach(function(r){
                html += '<tr>' + ${JSON.stringify(cols)}.map(function(c){
                  return '<td>' + esc(r[c] === undefined ? '' : r[c]) + '</td>';
                }).join('') + '</tr>';
              });
              rowsBox.innerHTML = html + '</tbody></table>';
            }
            draw('');
            if (${search}) {
              wrap.querySelector('.search').addEventListener('input', function(e){
                draw(e.target.value);
              });
            }
            window.__redraw_${nodeUidSafe(uid)} = draw;
          })();`);
        break;
      }

      case 'ui.form': {
        const t = bfSourceTable(uid) || null;
        const cols = String(cfg.fields || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const title = cfg.title || '新建';
        const btn = cfg.submit || '提交';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>${bfEscJS(title)}</h3>' +
              ${JSON.stringify(cols)}.map(function(c){
                return '<label class="fd"><span>' + esc(c) + '</span><input data-k="' + esc(c) + '"></label>';
              }).join('') +
              '<button class="btn">${bfEscJS(btn)}</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').addEventListener('click', function(){
              var obj = {};
              wrap.querySelectorAll('input[data-k]').forEach(function(i){
                obj[i.dataset.k] = i.value;
              });
              ${t ? `DB['${t}'] = DB['${t}'] || []; DB['${t}'].push(obj); saveDB();` : ''}
              ${t ? `if (window.__refresh) window.__refresh();` : ''}
              wrap.querySelectorAll('input').forEach(function(i){ i.value = ''; });
            });
          })();`);
        break;
      }

      case 'ui.detail': {
        const t = bfSourceTable(uid) || 'data';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>${bfEscJS(cfg.title || '详情')}</h3><div class="det"><p class="empty">点上面列表的一行看详情</p></div>';
            mount.appendChild(wrap);
            window.__detail_${nodeUidSafe(uid)} = function(row){
              var box = wrap.querySelector('.det');
              box.innerHTML = Object.keys(row).map(function(k){
                return '<div class="kv"><span>' + esc(k) + '</span><b>' + esc(row[k]) + '</b></div>';
              }).join('');
            };
          })();`);
        break;
      }

      case 'api.sms': {
        const len = Number(cfg.len) || 6, ttl = Number(cfg.ttl) || 300;
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>短信验证码</h3>' +
              '<div class="fd"><span>手机号</span><input id="ph_${nodeUidSafe(uid)}" maxlength="11"></div>' +
              '<div class="fd"><span>验证码</span><input id="cd_${nodeUidSafe(uid)}" maxlength="${len}"></div>' +
              '<button class="btn" id="send_${nodeUidSafe(uid)}">发验证码</button> ' +
              '<button class="btn ghost" id="chk_${nodeUidSafe(uid)}">验证</button>';
            mount.appendChild(wrap);
            var api = BF_API.sms({len:${len}, ttl:${ttl}, endpoint:'${bfEscJS(cfg.endpoint || "")}', key:'${bfEscJS(cfg.key || "")}'});
            wrap.querySelector('#send_${nodeUidSafe(uid)}').onclick = function(){
              api.send(wrap.querySelector('#ph_${nodeUidSafe(uid)}').value);
            };
            wrap.querySelector('#chk_${nodeUidSafe(uid)}').onclick = function(){
              var r = api.verify(wrap.querySelector('#ph_${nodeUidSafe(uid)}').value,
                                 wrap.querySelector('#cd_${nodeUidSafe(uid)}').value);
              BFR.toast(r.ok ? '验证通过' : r.why, r.ok ? 'ok' : 'err');
            };
          })();`);
        break;
      }

      case 'api.email': {
        const len2 = Number(cfg.len) || 6, ttl2 = Number(cfg.ttl) || 600;
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>邮箱验证码</h3>' +
              '<div class="fd"><span>邮箱</span><input id="em_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>验证码</span><input id="ec_${nodeUidSafe(uid)}" maxlength="${len2}"></div>' +
              '<button class="btn" id="es_${nodeUidSafe(uid)}">发验证码</button> ' +
              '<button class="btn ghost" id="ev_${nodeUidSafe(uid)}">验证</button>';
            mount.appendChild(wrap);
            var api = BF_API.email({len:${len2}, ttl:${ttl2}, endpoint:'${bfEscJS(cfg.endpoint || "")}', key:'${bfEscJS(cfg.key || "")}'});
            wrap.querySelector('#es_${nodeUidSafe(uid)}').onclick = function(){
              api.send(wrap.querySelector('#em_${nodeUidSafe(uid)}').value);
            };
            wrap.querySelector('#ev_${nodeUidSafe(uid)}').onclick = function(){
              var r = api.verify(wrap.querySelector('#em_${nodeUidSafe(uid)}').value,
                                 wrap.querySelector('#ec_${nodeUidSafe(uid)}').value);
              BFR.toast(r.ok ? '验证通过' : r.why, r.ok ? 'ok' : 'err');
            };
          })();`);
        break;
      }

      case 'api.captcha': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>图形验证码</h3>' +
              '<canvas id="cv_${nodeUidSafe(uid)}" width="110" height="44" style="cursor:pointer;border-radius:6px"></canvas>' +
              '<div class="fd" style="margin-top:10px"><span>输入</span><input id="ci_${nodeUidSafe(uid)}" maxlength="4"></div>' +
              '<button class="btn" id="cb_${nodeUidSafe(uid)}">校验</button>';
            mount.appendChild(wrap);
            var cap = BF_API.captcha('${bfEscJS(cfg.type || "字母数字")}');
            var cv = wrap.querySelector('#cv_${nodeUidSafe(uid)}');
            function redraw(){ cap = BF_API.captcha('字母数字'); cap.draw(cv); }
            cap.draw(cv);
            cv.onclick = redraw;
            wrap.querySelector('#cb_${nodeUidSafe(uid)}').onclick = function(){
              var ok = cap.verify(wrap.querySelector('#ci_${nodeUidSafe(uid)}').value);
              BFR.toast(ok ? '通过' : '不对，换一个再试', ok ? 'ok' : 'err');
              if (!ok) redraw();
            };
          })();`);
        break;
      }

      case 'api.login': {
        const canReg = String(cfg.mode || '').indexOf('注册') > -1;
        const onlyReg = String(cfg.mode || '') === '仅注册';
        jsParts.push(`
          (function(){
            var acc = BF_API.account({remember: ${cfg.remember !== false}});
            var cur = acc.current();
            var wrap = document.createElement('div');
            wrap.className = 'card';
            if (cur) {
              wrap.innerHTML = '<h3>账号</h3><p>已登录：<b>' + esc(cur.u) + '</b></p><button class="btn ghost" id="lo_${nodeUidSafe(uid)}">退出</button>';
              mount.appendChild(wrap);
              wrap.querySelector('#lo_${nodeUidSafe(uid)}').onclick = function(){ acc.logout(); location.reload(); };
              return;
            }
            wrap.innerHTML = '<h3>${bfEscJS(onlyReg ? "注册" : "登录" + (canReg ? " / 注册" : ""))}</h3>' +
              '<div class="fd"><span>账号</span><input id="lu_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>密码</span><input type="password" id="lp_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn" id="lg_${nodeUidSafe(uid)}">${bfEscJS(onlyReg ? "注册" : "登录")}</button>' +
              (${canReg && !onlyReg} ? ' <button class="btn ghost" id="rg_${nodeUidSafe(uid)}">注册</button>' : '');
            mount.appendChild(wrap);
            function grab(){ return [wrap.querySelector('#lu_${nodeUidSafe(uid)}').value, wrap.querySelector('#lp_${nodeUidSafe(uid)}').value]; }
            var lg = wrap.querySelector('#lg_${nodeUidSafe(uid)}');
            if (lg) lg.onclick = function(){
              var a = grab();
              var r = ${onlyReg ? 'acc.register(a[0], a[1])' : 'acc.login(a[0], a[1])'};
              BFR.toast(r.ok ? '成功' : r.why, r.ok ? 'ok' : 'err');
              if (r.ok) setTimeout(function(){ location.reload(); }, 600);
            };
            var rg = wrap.querySelector('#rg_${nodeUidSafe(uid)}');
            if (rg) rg.onclick = function(){
              var a = grab();
              var r = acc.register(a[0], a[1]);
              BFR.toast(r.ok ? '注册成功，去登录' : r.why, r.ok ? 'ok' : 'err');
            };
          })();`);
        break;
      }

      case 'api.upload': {
        const accept = cfg.accept || '';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>文件上传</h3>' +
              '<input type="file" id="uf_${nodeUidSafe(uid)}" ${accept ? `accept="${bfEscJS(accept)}"` : ''} ${cfg.multiple ? 'multiple' : ''}>' +
              '<div class="prev" id="up_${nodeUidSafe(uid)}"></div>';
            mount.appendChild(wrap);
            var pick = BF_API.upload({maxmb:${Number(cfg.maxmb) || 10}, multiple:${cfg.multiple ? 'true' : 'false'},
              endpoint:'${bfEscJS(cfg.endpoint || "")}', key:'${bfEscJS(cfg.key || "")}'}, function(list){
              var box = wrap.querySelector('#up_${nodeUidSafe(uid)}');
              box.innerHTML = list.map(function(f){
                if (f.data && /^data:image/.test(f.data)) {
                  return '<img src="' + f.data + '" style="max-width:120px;border-radius:6px;margin:6px 6px 0 0">';
                }
                return '<p class="empty">' + esc(f.name) + ' · ' + Math.round(f.size/1024) + 'KB</p>';
              }).join('');
            });
            wrap.querySelector('#uf_${nodeUidSafe(uid)}').onchange = function(e){ pick(e.target); };
          })();`);
        break;
      }

      case 'api.search': {
        const t = bfSourceTable(uid) || 'data';
        const sfields = cfg.fields || 'name';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>搜索</h3><input class="search" placeholder="输入关键字…"><div class="rows"></div>';
            mount.appendChild(wrap);
            var box = wrap.querySelector('.rows');
            function draw(kw){
              var rows = BF_API.search(DB['${t}'] || [], kw, '${bfEscJS(sfields)}');
              if (!rows.length) { box.innerHTML = '<p class="empty">没有匹配</p>'; return; }
              var cols = Object.keys(rows[0]);
              box.innerHTML = '<table><thead><tr>' + cols.map(function(c){ return '<th>'+esc(c)+'</th>'; }).join('') +
                '</tr></thead><tbody>' + rows.map(function(r){
                  return '<tr>' + cols.map(function(c){ return '<td>'+esc(r[c])+'</td>'; }).join('') + '</tr>';
                }).join('') + '</tbody></table>';
            }
            draw('');
            wrap.querySelector('.search').oninput = function(e){ draw(e.target.value); };
          })();`);
        break;
      }

      case 'api.export': {
        const t = bfSourceTable(uid) || 'data';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>数据导出</h3><button class="btn">导出 ${bfEscJS(cfg.format || "CSV")}</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              BF_API.download(DB['${t}'] || [], '${bfEscJS(cfg.format || "CSV")}', 'export');
            };
          })();`);
        break;
      }

      case 'api.voice': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>语音朗读</h3><div class="fd"><span>文字</span><input id="vt_${nodeUidSafe(uid)}" placeholder="输入要读的话"></div>' +
              '<button class="btn">朗读</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              BF_API.speak(wrap.querySelector('#vt_${nodeUidSafe(uid)}').value, ${Number(cfg.rate) || 1}, ${Number(cfg.pitch) || 1});
            };
          })();`);
        break;
      }

      case 'api.pay': {
        const cur = cfg.currency || '虚拟点';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>支付下单</h3>' +
              '<div class="fd"><span>金额</span><input id="pa_${nodeUidSafe(uid)}" type="number" value="100"></div>' +
              '<div class="fd"><span>说明</span><input id="pn_${nodeUidSafe(uid)}" placeholder="买什么"></div>' +
              '<button class="btn">确认支付</button>' +
              '<div class="rows" style="margin-top:10px"></div>';
            mount.appendChild(wrap);
            var api = BF_API.pay({currency:'${bfEscJS(cur)}'});
            function draw(){
              var arr = api.list();
              var box = wrap.querySelector('.rows');
              box.innerHTML = arr.length ? arr.map(function(p){
                return '<div class="kv"><span>' + esc(p.id) + '</span><b>' + p.amount + ' ${bfEscJS(cur)} · ' + esc(p.status) + '</b></div>';
              }).join('') : '<p class="empty">暂无支付记录</p>';
            }
            draw();
            wrap.querySelector('.btn').onclick = function(){
              api.create(wrap.querySelector('#pa_${nodeUidSafe(uid)}').value);
              draw();
            };
          })();`);
        break;
      }

      case 'api.refund': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>退款</h3>' +
              '<div class="fd"><span>单号</span><input id="ro_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>原因</span><input id="rr_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn">申请退款</button>';
            mount.appendChild(wrap);
            var api = BF_API.refund({reason: ${cfg.reason !== false}});
            wrap.querySelector('.btn').onclick = function(){
              var r = api.byOrder(wrap.querySelector('#ro_${nodeUidSafe(uid)}').value,
                                  wrap.querySelector('#rr_${nodeUidSafe(uid)}').value);
              BFR.toast(r.ok ? '退款成功' : r.why, r.ok ? 'ok' : 'err');
            };
          })();`);
        break;
      }

      case 'api.order': {
        const t = bfSourceTable(uid) || 'data';
        jsParts.push(`
          (function(){
            var api = BF_API.order('${bfEscJS(t)}');
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>订单查询</h3>' +
              '<div class="fd"><span>单号</span><input id="oq_${nodeUidSafe(uid)}" placeholder="留空查全部"></div>' +
              '<button class="btn">查询</button><div class="rows" style="margin-top:10px"></div>';
            mount.appendChild(wrap);
            function draw(rows){
              var box = wrap.querySelector('.rows');
              if (!rows.length) { box.innerHTML = '<p class="empty">没有订单</p>'; return; }
              var cols = Object.keys(rows[0]);
              box.innerHTML = '<table><thead><tr>' + cols.map(function(c){return '<th>'+esc(c)+'</th>'}).join('') +
                '</tr></thead><tbody>' + rows.map(function(r){
                  return '<tr>' + cols.map(function(c){return '<td>'+esc(r[c])+'</td>'}).join('') + '</tr>';
                }).join('') + '</tbody></table>';
            }
            draw(api.all());
            wrap.querySelector('.btn').onclick = function(){
              var q = wrap.querySelector('#oq_${nodeUidSafe(uid)}').value.trim();
              draw(api.query({id: q || undefined}));
            };
          })();`);
        break;
      }

      case 'api.coupon': {
        jsParts.push(`
          (function(){
            var api = BF_API.coupon({kind:'${bfEscJS(cfg.kind || "满减")}'});
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>优惠券</h3>' +
              '<div class="fd"><span>名称</span><input id="ct_${nodeUidSafe(uid)}" placeholder="新人券"></div>' +
              '<div class="fd"><span>面值</span><input id="cv_${nodeUidSafe(uid)}" type="number" value="10"></div>' +
              '<div class="fd"><span>门槛</span><input id="cm_${nodeUidSafe(uid)}" type="number" value="50"></div>' +
              '<button class="btn">发券</button><div class="rows" style="margin-top:10px"></div>';
            mount.appendChild(wrap);
            function draw(){
              var arr = api.list();
              var box = wrap.querySelector('.rows');
              box.innerHTML = arr.length ? arr.map(function(c){
                return '<div class="kv"><span>' + esc(c.code) + '</span><b>' + esc(c.title) + ' · 减' + c.value + (c.used?' (已用)':'') + '</b></div>';
              }).join('') : '<p class="empty">还没发过券</p>';
            }
            draw();
            wrap.querySelector('.btn').onclick = function(){
              api.create(wrap.querySelector('#ct_${nodeUidSafe(uid)}').value || '优惠券',
                         wrap.querySelector('#cv_${nodeUidSafe(uid)}').value,
                         wrap.querySelector('#cm_${nodeUidSafe(uid)}').value);
              draw();
            };
          })();`);
        break;
      }

      case 'api.push': {
        jsParts.push(`
          (function(){
            var api = BF_API.push({keep:${Number(cfg.keep) || 30}});
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>站内消息 <small class="badge">未读 <b>0</b></small></h3>' +
              '<div class="fd"><span>标题</span><input id="pt_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>内容</span><input id="pb_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn">发送</button><div class="rows" style="margin-top:10px"></div>';
            mount.appendChild(wrap);
            function draw(){
              var arr = api.list();
              wrap.querySelector('.badge b').textContent = api.unread();
              var box = wrap.querySelector('.rows');
              box.innerHTML = arr.length ? arr.map(function(m){
                return '<div class="kv"><span>' + esc(m.title) + '</span><b>' + esc(m.body) + '</b></div>';
              }).join('') : '<p class="empty">暂无消息</p>';
            }
            draw();
            wrap.querySelector('.btn').onclick = function(){
              api.send('all', wrap.querySelector('#pt_${nodeUidSafe(uid)}').value,
                       wrap.querySelector('#pb_${nodeUidSafe(uid)}').value);
              draw();
            };
          })();`);
        break;
      }

      case 'api.map': {
        jsParts.push(`
          (function(){
            var api = BF_API.map({city:'${bfEscJS(cfg.city || "杭州")}'});
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>地图选点</h3>' +
              '<div class="mapbox" style="height:120px;background:#0b1220;border:1px solid #1e2f4a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#7d93ad;font-size:12px;cursor:crosshair">点这里选位置</div>' +
              '<p class="empty" id="mr_${nodeUidSafe(uid)}">还没选</p>';
            mount.appendChild(wrap);
            var box = wrap.querySelector('.mapbox');
            box.onclick = function(e){
              var r = box.getBoundingClientRect();
              var lat = 30.27 + (r.height/2 - (e.clientY - r.top)) / 10000;
              var lng = 120.15 + ((e.clientX - r.left) - r.width/2) / 10000;
              var p = api.pick(lat, lng);
              wrap.querySelector('#mr_${nodeUidSafe(uid)}').textContent =
                api.address(p.lat, p.lng) + ' · ' + p.lat.toFixed(4) + ',' + p.lng.toFixed(4);
              box.innerHTML = '<b style="color:#22d3ee;font-size:20px">⌖</b>';
            };
          })();`);
        break;
      }

      case 'api.notify': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>多渠道通知</h3>' +
              '<div class="fd"><span>内容</span><input id="nt_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn">发送</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              var ch = '${bfEscJS(cfg.channels || "短信,邮件")}'.split(',');
              BFR.toast('【模拟】已通过 ' + ch.join('/') + ' 发送', 'ok');
            };
          })();`);
        break;
      }

      case 'api.storage': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>本地存储</h3>' +
              '<div class="fd"><span>键</span><input id="sk_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>值</span><input id="sv_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn">写入</button> <button class="btn ghost">读取</button>' +
              '<p class="empty" id="sr_${nodeUidSafe(uid)}"></p>';
            mount.appendChild(wrap);
            var btns = wrap.querySelectorAll('.btn');
            btns[0].onclick = function(){
              BFR.set('user.' + wrap.querySelector('#sk_${nodeUidSafe(uid)}').value, wrap.querySelector('#sv_${nodeUidSafe(uid)}').value);
              BFR.toast('已写入', 'ok');
            };
            btns[1].onclick = function(){
              var v = BFR.get('user.' + wrap.querySelector('#sk_${nodeUidSafe(uid)}').value, null);
              wrap.querySelector('#sr_${nodeUidSafe(uid)}').textContent = v === null ? '（空）' : String(v);
            };
          })();`);
        break;
      }

      case 'api.ai': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>AI 对话</h3>' +
              '<div class="chat" id="ch_${nodeUidSafe(uid)}" style="max-height:160px;overflow:auto;margin-bottom:10px"></div>' +
              '<div class="fd"><span>说</span><input id="ai_${nodeUidSafe(uid)}" placeholder="问点什么…"></div>' +
              '<button class="btn">发送</button>';
            mount.appendChild(wrap);
            var box = wrap.querySelector('#ch_${nodeUidSafe(uid)}');
            var cfg = {endpoint:'${bfEscJS(cfg.endpoint || "")}', key:'${bfEscJS(cfg.key || "")}', model:'${bfEscJS(cfg.model || "deepseek-chat")}'};
            function say(who, txt){
              box.innerHTML += '<div class="kv"><span>' + who + '</span><b>' + esc(txt) + '</b></div>';
              box.scrollTop = box.scrollHeight;
            }
            wrap.querySelector('.btn').onclick = function(){
              var q = wrap.querySelector('#ai_${nodeUidSafe(uid)}').value.trim();
              if (!q) return;
              say('我', q);
              wrap.querySelector('#ai_${nodeUidSafe(uid)}').value = '';
              if (!cfg.endpoint) {
                setTimeout(function(){ say('AI', '【模拟回复】收到：' + q + '（配好接口地址就是真的）'); }, 400);
                return;
              }
              BFR.request({endpoint: cfg.endpoint, key: cfg.key, method:'POST',
                body:{model: cfg.model, messages:[{role:'user', content:q}]}}, function(r){
                var txt = r.ok && r.data && (r.data.reply || (r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content));
                say('AI', txt || ('调用失败：' + (r.error || r.status)));
              });
            };
          })();`);
        break;
      }

      case 'api.page': {
        const t = bfSourceTable(uid) || 'data';
        const size = Number(cfg.size) || 10;
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>分页列表</h3><div class="rows"></div><div class="pager" style="margin-top:10px;text-align:center"></div>';
            mount.appendChild(wrap);
            var cur = 1;
            function draw(){
              var rows = DB['${t}'] || [];
              var p = BF_API.page(rows, ${size}, cur);
              cur = p.cur;
              var box = wrap.querySelector('.rows');
              if (!p.rows.length) { box.innerHTML = '<p class="empty">没有数据</p>'; }
              else {
                var cols = Object.keys(p.rows[0]);
                box.innerHTML = '<table><thead><tr>' + cols.map(function(c){return '<th>'+esc(c)+'</th>'}).join('') +
                  '</tr></thead><tbody>' + p.rows.map(function(r){
                    return '<tr>' + cols.map(function(c){return '<td>'+esc(r[c])+'</td>'}).join('') + '</tr>';
                  }).join('') + '</tbody></table>';
              }
              wrap.querySelector('.pager').innerHTML =
                '<button class="btn ghost tiny" data-p="prev">上一页</button> ' +
                '<span style="font-size:12px;color:#7d93ad;margin:0 10px">' + p.cur + ' / ' + (p.total||1) + '</span>' +
                '<button class="btn ghost tiny" data-p="next">下一页</button>';
              wrap.querySelectorAll('[data-p]').forEach(function(b){
                b.onclick = function(){
                  if (b.dataset.p === 'prev' && cur > 1) { cur--; draw(); }
                  if (b.dataset.p === 'next' && cur < p.total) { cur++; draw(); }
                };
              });
            }
            draw();
          })();`);
        break;
      }

      case 'api.filter': {
        const t2 = bfSourceTable(uid) || 'data';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>筛选排序</h3>' +
              '<div class="fd"><span>字段</span><input id="ff_${nodeUidSafe(uid)}" placeholder="amount"></div>' +
              '<div class="fd"><span>排序</span><input id="fs_${nodeUidSafe(uid)}" value="${bfEscJS(cfg.sortby || 'id desc')}"></div>' +
              '<button class="btn">应用</button><div class="rows" style="margin-top:10px"></div>';
            mount.appendChild(wrap);
            function draw(){
              var rows = (DB['${t2}'] || []).slice();
              var spec = wrap.querySelector('#fs_${nodeUidSafe(uid)}').value.trim().split(/\s+/);
              var key = spec[0], desc = (spec[1] || '').toLowerCase() === 'desc';
              if (key) {
                rows.sort(function(a,b){
                  var x = a[key], y = b[key];
                  if (typeof x === 'number' && typeof y === 'number') return desc ? y-x : x-y;
                  return desc ? String(y).localeCompare(String(x)) : String(x).localeCompare(String(y));
                });
              }
              var box = wrap.querySelector('.rows');
              if (!rows.length) { box.innerHTML = '<p class="empty">没有数据</p>'; return; }
              var cols = Object.keys(rows[0]);
              box.innerHTML = '<table><thead><tr>' + cols.map(function(c){return '<th>'+esc(c)+'</th>'}).join('') +
                '</tr></thead><tbody>' + rows.map(function(r){
                  return '<tr>' + cols.map(function(c){return '<td>'+esc(r[c])+'</td>'}).join('') + '</tr>';
                }).join('') + '</tbody></table>';
            }
            draw();
            wrap.querySelector('.btn').onclick = draw;
          })();`);
        break;
      }

      case 'api.geo': {
        const unit = cfg.unit || '公里';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>距离计算</h3>' +
              '<div class="fd"><span>点A</span><input id="ga_${nodeUidSafe(uid)}" placeholder="30.27,120.15"></div>' +
              '<div class="fd"><span>点B</span><input id="gb_${nodeUidSafe(uid)}" placeholder="30.30,120.20"></div>' +
              '<button class="btn">计算</button><p class="empty" id="gr_${nodeUidSafe(uid)}"></p>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              var a = wrap.querySelector('#ga_${nodeUidSafe(uid)}').value.split(',');
              var b = wrap.querySelector('#gb_${nodeUidSafe(uid)}').value.split(',');
              if (a.length < 2 || b.length < 2) { BFR.toast('格式：纬度,经度', 'err'); return; }
              var d = BF_API.distance(Number(a[0]), Number(a[1]), Number(b[0]), Number(b[1]), '${bfEscJS(unit)}');
              wrap.querySelector('#gr_${nodeUidSafe(uid)}').textContent = '距离：' + d + ' ${bfEscJS(unit)}';
            };
          })();`);
        break;
      }

      case 'api.log': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>操作日志</h3><div class="rows"></div>';
            mount.appendChild(wrap);
            var arr = BFR.get('logs', []);
            var box = wrap.querySelector('.rows');
            box.innerHTML = arr.length ? arr.slice(0, 50).map(function(l){
              return '<div class="kv"><span>' + esc(l.who) + '</span><b>' + esc(l.act) + '</b></div>';
            }).join('') : '<p class="empty">暂无日志</p>';
          })();`);
        break;
      }

      case 'api.webhook': {
        const method = cfg.method || 'POST';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>Webhook</h3>' +
              '<div class="fd"><span>数据</span><input id="wb_${nodeUidSafe(uid)}" placeholder="JSON 或文本"></div>' +
              '<button class="btn">${bfEscJS(method)}</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              var ep = '${bfEscJS(cfg.endpoint || "")}';
              if (!ep) { BFR.toast('先在块里填接口地址', 'err'); return; }
              var raw = wrap.querySelector('#wb_${nodeUidSafe(uid)}').value;
              var body;
              try { body = JSON.parse(raw); } catch(e) { body = { text: raw }; }
              BFR.request({endpoint: ep, key:'${bfEscJS(cfg.key || "")}', method:'${bfEscJS(method)}', body: body}, function(r){
                BFR.toast(r.ok ? '发出去了' : ('失败 ' + (r.error || r.status)), r.ok ? 'ok' : 'err');
              });
            };
          })();`);
        break;
      }

      case 'api.oauth': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>第三方登录</h3><div class="oauth-btns"></div>';
            mount.appendChild(wrap);
            var ps = '${bfEscJS(cfg.providers || "微信,QQ")}'.split(',');
            var box = wrap.querySelector('.oauth-btns');
            ps.forEach(function(p){
              var b = document.createElement('button');
              b.className = 'btn ghost';
              b.style.marginRight = '8px';
              b.textContent = p.trim() + ' 登录';
              b.onclick = function(){ BFR.toast('【模拟】' + p.trim() + ' 授权中…', 'ok'); };
              box.appendChild(b);
            });
          })();`);
        break;
      }

      case 'api.realname': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>实名认证</h3>' +
              '<div class="fd"><span>姓名</span><input id="rn_${nodeUidSafe(uid)}"></div>' +
              '<div class="fd"><span>身份证</span><input id="ri_${nodeUidSafe(uid)}" maxlength="18"></div>' +
              '<button class="btn">核验</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              var id = wrap.querySelector('#ri_${nodeUidSafe(uid)}').value.trim();
              var okFmt = /^\d{17}[\dXx]$/.test(id);
              BFR.toast(okFmt ? '【模拟】格式通过（真实核验需后端）' : '身份证格式不对', okFmt ? 'ok' : 'err');
            };
          })();`);
        break;
      }

      case 'api.image': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>图片压缩</h3>' +
              '<input type="file" accept="image/*" id="if_${nodeUidSafe(uid)}">' +
              '<p class="empty" id="ir_${nodeUidSafe(uid)}">选一张图试试</p>';
            mount.appendChild(wrap);
            wrap.querySelector('#if_${nodeUidSafe(uid)}').onchange = function(e){
              var f = e.target.files[0];
              if (!f) return;
              BF_API.compress(f, ${Number(cfg.quality) || 0.8}, function(blob, info){
                wrap.querySelector('#ir_${nodeUidSafe(uid)}').textContent =
                  '压缩前 ' + Math.round(info.before/1024) + 'KB → 压缩后 ' + Math.round(info.after/1024) + 'KB';
              });
            };
          })();`);
        break;
      }

      case 'api.ocr': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>文字识别</h3>' +
              '<input type="file" accept="image/*" id="of_${nodeUidSafe(uid)}">' +
              '<p class="empty" id="or_${nodeUidSafe(uid)}">选图识别（模拟）</p>';
            mount.appendChild(wrap);
            wrap.querySelector('#of_${nodeUidSafe(uid)}').onchange = function(){
              wrap.querySelector('#or_${nodeUidSafe(uid)}').textContent = '【模拟识别结果】这是一段示例文字，真实识别需接 OCR 接口。';
            };
          })();`);
        break;
      }

      case 'api.translate': {
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>翻译</h3>' +
              '<div class="fd"><span>原文</span><input id="ts_${nodeUidSafe(uid)}"></div>' +
              '<button class="btn">翻译成 ${bfEscJS(cfg.to || "英文")}</button>' +
              '<p class="empty" id="tr_${nodeUidSafe(uid)}"></p>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').onclick = function(){
              wrap.querySelector('#tr_${nodeUidSafe(uid)}').textContent = '【模拟】Translation result goes here.';
            };
          })();`);
        break;
      }

      case 'api.cache': {
        jsParts.push(`
          (function(){
            var c = BF_API.cache(${Number(cfg.ttl) || 60});
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<h3>接口缓存</h3><p class="empty">缓存 ${Number(cfg.ttl) || 60} 秒内同样的请求不会重发</p>';
            mount.appendChild(wrap);
          })();`);
        break;
      }

      case 'lg.wallet': {
        const acc = cfg.account || 'main';
        const init = Number(cfg.init) || 0;
        const unit = cfg.unit || '白饭';
        jsParts.push(`
          (function(){
            window.__wallet = window.__wallet || {};
            if (window.__wallet['${bfEscJS(acc)}'] === undefined) {
              window.__wallet['${bfEscJS(acc)}'] = ${init};
            }
            var wrap = document.createElement('div');
            wrap.className = 'card wallet';
            wrap.innerHTML = '<h3>钱包</h3><div class="wbal"><b>' +
              window.__wallet['${bfEscJS(acc)}'] + '</b><span>${bfEscJS(unit)}</span></div>';
            mount.appendChild(wrap);
          })();`);
        break;
      }

      case 'lg.flow': {
        const fld = cfg.field || 'status';
        const states = String(cfg.states || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        const rules = String(cfg.rules || '').split('\n').map(s => s.trim()).filter(Boolean)
          .map(r => r.split('>').map(x => x.trim()));
        jsParts.push(`
          window.__flow = window.__flow || {};
          window.__flow['${bfEscJS(fld)}'] = {
            states: ${JSON.stringify(states)},
            rules: ${JSON.stringify(rules)},
            can: function(from, to) {
              return this.rules.some(function(r){ return r[0] === from && r[1] === to; });
            },
            move: function(row, to) {
              var from = row['${bfEscJS(fld)}'];
              if (!this.can(from, to)) return false;
              row['${bfEscJS(fld)}'] = to;
              saveDB();
              return true;
            }
          };`);
        break;
      }

      case 'lg.cond': {
        const t = bfSourceTable(uid) || 'data';
        const filter = bfCondFilter(cfg);
        const yesNodes = (bfGraph().out[uid] || []);
        const noNodes = [];
        // 判断下游：第一个下游算 yes，第二个算 no
        jsParts.push(`
          window.__cond = window.__cond || {};
          window.__cond['${nodeUidSafe(uid)}'] = (DB['${t}'] || []).filter(${filter});`);
        // 为下游提供数据源别名
        const allRows = `(DB['${t}'] || [])`;
        jsParts.push(`
          window.__condNo = window.__condNo || {};
          window.__condNo['${nodeUidSafe(uid)}'] = ${allRows}.filter(function(r){
            return !(${filter})(r);
          });`);
        break;
      }

      case 'ui.button': {
        const txt = cfg.text || '点我';
        const act = cfg.action || 'alert';
        jsParts.push(`
          (function(){
            var wrap = document.createElement('div');
            wrap.className = 'card';
            wrap.innerHTML = '<button class="btn">${bfEscJS(txt)}</button>';
            mount.appendChild(wrap);
            wrap.querySelector('.btn').addEventListener('click', function(){
              var a = '${bfEscJS(act)}';
              if (a === 'alert') { alert('${bfEscJS(txt)}'); }
              else if (a === '清空数据') {
                if (confirm('确定清空本地数据？')) { DB = {}; saveDB(); location.reload(); }
              }
              else if (a === '导出数据') {
                var blob = new Blob([JSON.stringify(DB, null, 2)], {type:'application/json'});
                var el = document.createElement('a');
                el.href = URL.createObjectURL(blob);
                el.download = 'data.json';
                el.click();
              }
            });
          })();`);
        break;
      }

      case 'lg.timer': {
        const every = Math.max(1, Number(cfg.every) || 60) * 1000;
        jsParts.push(`
          setInterval(function(){
            if (window.__refresh) window.__refresh();
          }, ${every});`);
        break;
      }
      default: {
        if (def.custom) {
          jsParts.push(bfGenCustom(node, def));
        }
        break;
      }
    }
  });

  return { jsParts, htmlParts };
}

function nodeUidSafe(uid) {
  return String(uid).replace(/[^a-zA-Z0-9_]/g, '_');
}

function bfEsc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bfEscJS(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

/* ---------- 主函数：拼出整站 ---------- */
function bfBuildSite() {
  const order = bfTopoOrder();
  const { jsParts, htmlParts } = bfGenNodes(order);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>我的系统</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
     background:#0b1220;color:#dbe7f5;font-size:14px;line-height:1.6}
.nav{display:flex;align-items:center;justify-content:space-between;
     padding:14px 20px;background:#101a2e;border-bottom:1px solid #1e2f4a}
.nav b{color:#22d3ee;font-size:16px}
.nav a{color:#7d93ad;text-decoration:none;margin-left:18px;font-size:13px}
.nav a:hover{color:#22d3ee}
#mount{max-width:900px;margin:24px auto;padding:0 16px;
       display:flex;flex-direction:column;gap:16px}
.card{background:#142034;border:1px solid #1e2f4a;border-radius:10px;padding:16px}
.card h3{font-size:14px;color:#22d3ee;margin-bottom:12px;font-weight:600}
.stat{background:#142034;border:1px solid #1e2f4a;border-radius:10px;
      padding:16px;display:inline-flex;flex-direction:column;min-width:140px}
.stat b{font-size:26px;color:#4ade80}
.stat span{font-size:12px;color:#7d93ad;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #1e2f4a}
th{color:#7d93ad;font-weight:500;font-size:12px}
td{color:#dbe7f5}
tr:hover td{background:#101a2e}
.search{width:100%;padding:8px 10px;margin-bottom:10px;background:#0b1220;
        border:1px solid #1e2f4a;border-radius:6px;color:#dbe7f5;font-size:13px}
.search:focus{outline:none;border-color:#22d3ee}
.empty{color:#7d93ad;font-size:13px;padding:12px 0}
.fd{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.fd span{width:90px;color:#7d93ad;font-size:13px}
.fd input{flex:1;padding:7px 10px;background:#0b1220;border:1px solid #1e2f4a;
          border-radius:6px;color:#dbe7f5;font-size:13px}
.fd input:focus{outline:none;border-color:#22d3ee}
.btn{padding:8px 20px;background:#22d3ee;border:none;border-radius:6px;
     color:#0b1220;font-weight:600;cursor:pointer;font-size:13px}
.btn:hover{background:#3ee0f5}
.kv{display:flex;justify-content:space-between;padding:7px 0;
    border-bottom:1px solid #1e2f4a;font-size:13px}
.kv span{color:#7d93ad}
.kv b{color:#dbe7f5;font-weight:500}
.foot{text-align:center;color:#3d4f68;font-size:11px;padding:20px 0 30px}
</style>
</head>
<body>
${htmlParts.join('\n')}
<div id="mount"></div>
<div class="foot">由积木工坊生成 · v1.0.0</div>

<script>
/* ---------- 运行时（接口实现） ---------- */
${bfRuntimeCode()}

/* ---------- 运行时 ---------- */
var DB = {};
var mount = document.getElementById('mount');

function esc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function saveDB() {
  try { localStorage.setItem('bfdb', JSON.stringify(DB)); } catch(e) {}
}
function loadDB() {
  try {
    var raw = localStorage.getItem('bfdb');
    if (raw) {
      var d = JSON.parse(raw);
      Object.keys(d).forEach(function(k) {
        if (!DB[k] || !DB[k].length) DB[k] = d[k];
      });
    }
  } catch(e) {}
}

window.__refresh = function() {
  mount.innerHTML = '';
  ${jsParts.length ? 'build();' : ''}
};

function build() {
${jsParts.map(s => '  ' + s).join('\n')}
}

loadDB();
build();
</script>
</body>
</html>`;
}

/* ============================================================
   v1.1.0 新增：钱包 / 状态流转 / 条件判断 / 按钮 / 自定义块
   ============================================================ */

/* 找到某块上游里指定类型的块 */
function bfUpstream(uid, blockId) {
  const { inn } = bfGraph();
  const res = [];
  (inn[uid] || []).forEach(u => {
    const info = bfNodeCfg(u);
    if (info && info.def.id === blockId) res.push(info);
  });
  return res;
}

/* 生成自定义块的渲染代码：把模板里的 {{字段}} 换成值 */
function bfGenCustom(node, def) {
  const tpl = def.template || '';
  const html = tpl.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) => {
    const v = node.cfg[k];
    return bfEscJS(v === undefined || v === null ? '' : v);
  });
  return `
    (function(){
      var wrap = document.createElement('div');
      wrap.innerHTML = '${html}';
      mount.appendChild(wrap);
    })();`;
}

/* 生成条件判断的过滤函数 */
function bfCondFilter(cfg) {
  const f = String(cfg.field || '').replace(/'/g, "\\'");
  const op = String(cfg.op || '>=').trim();
  const raw = cfg.value === undefined ? '' : String(cfg.value);
  const num = Number(raw);
  const isNum = raw !== '' && !isNaN(num);
  const val = isNum ? String(num) : `'${raw.replace(/'/g, "\\'")}'`;
  return `function(r){
    var v = r['${f}'];
    ${isNum ? 'v = Number(v);' : ''}
    return v ${op} ${val};
  }`;
}
