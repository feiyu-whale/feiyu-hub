/* 公司经营模拟 · 界面层 v1.0.0 2026-10-24 肥鱼 */
const $ = id => document.getElementById(id);
const money = v => {
  const w = v / 1e4;
  if (Math.abs(w) >= 10000) return (w / 10000).toFixed(2) + ' 亿';
  return w.toFixed(1) + ' 万';
};
const pct = v => (v * 100).toFixed(1) + '%';

let choiceCtx = null;   // 待选事件

function render() {
  const p = P();
  if (typeof renderActions === 'function') renderActions();
  $('cash').textContent = money(G.cash);
  const _td = totalDebt();
  $('debt').textContent = money(_td);
  // v3.1.0：按天模式下显示「第 3 月·第 12 天」，按月模式显示「第 3 月」
  $('month').textContent = (G.pace === 'day' && G.month >= 0 && G.day)
    ? (G.month + 1) + '月·第' + G.day + '天'
    : G.month;
  $('stores').textContent = G.stores;
  $('seg').textContent = p.icon + ' ' + p.name;
  $('rep').textContent = G.reputation.toFixed(0);
  $('morale').textContent = G.morale.toFixed(0);
  if ($('staff')) $('staff').textContent = G.staff;
  if ($('staff2')) $('staff2').textContent = G.staff;
  if ($('credit')) {
    const c = G.credit;
    $('credit').textContent = c.toFixed(0);
    $('credit').className = 'v ' + (c >= 70 ? 'good' : c >= 40 ? 'warn' : 'bad');
  }
  if ($('avail')) {
    const av = Math.max(0, creditLimit() - totalDebt());
    $('avail').textContent = money(av);
    $('avail').className = 'v' + (av < 50000 ? ' bad' : '');
  }
  if ($('monthlyPay')) {
    let mpay = 0;
    G.loans.forEach(ln => {
      const r = ln.rate / 12, n = ln.term;
      mpay += ln.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    });
    $('monthlyPay').textContent = mpay > 0 ? money(mpay) : '无';
    $('monthlyPay').className = 'v' + (mpay > 0 ? ' warn' : '');
  }

  const stage = STAGES.find(s => G.stores >= s.minStores && G.stores <= s.maxStores) || STAGES[0];
  $('stage').textContent = stage.name;

  // 城市 / 竞争 / 风险 显示
  if ($('cityLabel') && G.cityMod) {
    $('cityLabel').textContent = G.cityMod.city.name + '·' + G.cityMod.district.name;
  }
  if ($('riskVal')) {
    const r = G.riskBuildup || 0;
    $('riskVal').textContent = r.toFixed(0);
    $('riskVal').className = 'v ' + (r >= 30 ? 'bad' : r >= 15 ? 'warn' : r > 0 ? '' : 'good');
  }
  if ($('rivalVal')) {
    const n = (G.rivals || []).length;
    $('rivalVal').textContent = n + ' 家';
    $('rivalVal').className = 'v ' + (G.compIntensity >= 1.5 ? 'bad' : G.compIntensity >= 1 ? 'warn' : 'good');
  }
  if ($('orgVal')) {
    const o = G.hasCompany ? '公司化' : G.hasHQ ? '总部' : '无';
    $('orgVal').textContent = o;
    $('orgVal').className = 'v ' + (G.hasCompany ? 'good' : G.hasHQ ? '' : 'warn');
  }

  // 现金为负变红
  $('cash').className = G.cash < 0 ? 'v bad' : 'v';
  $('debt').className = _td > 0 ? 'v warn' : 'v';

  // 月度历史
  const tbody = $('history');
  tbody.innerHTML = G.history.slice(-12).reverse().map(l => `
    <tr>
      <td>${l.month}</td>
      <td>${money(l.revenue)}</td>
      <td class="${l.netProfit >= 0 ? 'good' : 'bad'}">${money(l.netProfit)}</td>
      <td class="${l.cashAfter >= 0 ? '' : 'bad'}">${money(l.cashAfter)}</td>
    </tr>`).join('');

  // 状态
  if (G.status === 'bankrupt') {
    // v3.0.0：破产不再直接 Game Over，先给一纸清算通知，可选择「打工还债」
    $('status').innerHTML = '<div class="over">💀 公司破产清算</div>';
    if ($('btnNext')) $('btnNext').disabled = true;
    if ($('btnOpen')) $('btnOpen').disabled = true;
    const ep = $('endingPanel');
    if (ep) {
      if (!G.debtMode) {
        ep.innerHTML = `<div style="background:#141418;border:1px solid #3a3a40;padding:18px;text-align:center;color:#c0c0c0;line-height:1.9;max-width:560px;margin:12px auto">
          <div style="font-size:16px;color:#e05050;margin-bottom:10px">资产清算完毕</div>
          <div style="font-size:13px;color:#999">店没了，设备搬走了，供应商在门口等钱。<br>账上还欠着钱，债不会因为公司没了就消失。</div>
          <button class="tbtn" style="margin-top:14px" onclick="enterDebtMode()">去打工还债 →</button>
        </div>`;
      } else {
        ep.innerHTML = debtHTML() + `<div style="text-align:center;margin:12px 0">
          <button class="tbtn" onclick="debtNextMonth()">再干一个月</button>
          <button class="tbtn" onclick="giveUpDebt()">放弃（重开）</button></div>`;
      }
    }
  } else if (G.status === 'caught') {
    $('status').innerHTML = '<div class="over" style="color:#ff4040">🚨 被查处关停</div>';
    if ($('btnNext')) $('btnNext').disabled = true;
    if ($('btnOpen')) $('btnOpen').disabled = true;
    const ep = $('endingPanel');
    // v3.2.0：跑与不跑之后先走「等判决」，再出判决书
    if (ep && !G.verdictShown) {
      if (G.waitingVerdict && typeof showWaitingVerdict === 'function') {
        G.verdictShown = true;
        showWaitingVerdict();
      } else {
        ep.innerHTML = (typeof verdictHTML === 'function') ? verdictHTML() : '';
      }
    }
  } else if (G.status === 'fled') {
    $('status').innerHTML = '<div class="over" style="color:#c9a050">✈️ 已出境</div>';
    if ($('btnNext')) $('btnNext').disabled = true;
    if ($('btnOpen')) $('btnOpen').disabled = true;
    if (!G.fledShown) {
      G.fledShown = true;
      if (typeof showFledEnding === 'function') showFledEnding((G.fallout && G.fallout.totalPaid) || 0);
    }
  } else if (G.status === 'debt') {
    const ep = $('endingPanel');
    if (ep) ep.innerHTML = debtHTML() + `<div style="text-align:center;margin:12px 0">
      <button class="tbtn" onclick="debtNextMonth()">再干一个月</button>
      <button class="tbtn" onclick="giveUpDebt()">放弃（重开）</button></div>`;
  } else if (G.status === 'listed') {
    $('status').innerHTML = '<div class="over" style="color:#ffd860">🔔 已上市</div>';
    if ($('btnNext')) $('btnNext').disabled = true;
    if ($('btnOpen')) $('btnOpen').disabled = true;
    const ep = $('endingPanel');
    if (ep && !G.listedShown) {
      G.listedShown = true;
      ep.innerHTML = (typeof listedEndingHTML === 'function') ? listedEndingHTML() : '';
    }
  } else if (G.status === 'sold') {
    $('status').innerHTML = '<div class="over" style="color:#7fe0a8">🌿 已退出</div>';
    if ($('btnNext')) $('btnNext').disabled = true;
    if ($('btnOpen')) $('btnOpen').disabled = true;
    const ep = $('endingPanel');
    if (ep && !G.soldShown) {
      G.soldShown = true;
      ep.innerHTML = (typeof sellEndingHTML === 'function') ? sellEndingHTML() : '';
    }
  }
  // v3.3.0 团购定价面板
  if (typeof renderPricePanel === 'function') { try { renderPricePanel(); } catch (e) { } }
  // v3.4.0 新品研发面板
  if (typeof renderResearchPanel === 'function') { try { renderResearchPanel(); } catch (e) { } }
  // v3.5.0 厨师面板
  if (typeof renderChefPanel === 'function') { try { renderChefPanel(); } catch (e) { } }
  // v3.5.1 推广面板
  if (typeof renderPromoPanel === 'function') { try { renderPromoPanel(); } catch (e) { } }
}

/* ═══ v3.3.0 结局三·卖掉公司养老 ═══ */
function showSellPanel() {
  const panel = $('reportPanel');
  if (!panel) return;
  if (G.status !== 'running') return;
  const v = sellValuation();
  const debt = (typeof totalDebt === 'function') ? totalDebt() : 0;
  const net = v.price - debt;
  panel.style.display = 'block';
  panel.innerHTML = `<div style="font-size:14px;font-weight:700;color:#7fe0a8;margin-bottom:10px">🌿 卖掉公司，收手养老</div>
  <div style="font-size:12px;line-height:1.9;color:#a8b8a8">
    收购方报价 <b style="color:#ffd860">${(v.price/1e4).toFixed(0)} 万</b>，
    还完债到手 <b style="color:#ffd860">${(net/1e4).toFixed(0)} 万</b>。<br>
    ${v.loss ? '（当前是亏损状态，按净资产打折清算）' : '（按最近一年利润的 ' + v.pe + ' 倍 PE 估值）'}<br>
    <span style="color:#8a7a6a">卖掉之后，这家店就不再是你的了。没有回头路。</span>
  </div>
  <div style="margin-top:12px">
    <button class="tbtn" style="border-color:#3a6a4a;color:#80c090" onclick="confirmSell()">确认卖掉</button>
    <button class="tbtn" onclick="closeReport()">再想想</button>
  </div>`;
}

function confirmSell() {
  if (!confirm('真的要卖掉吗？卖掉之后游戏就结束了。')) return;
  const v = sellValuation();
  const debt = (typeof totalDebt === 'function') ? totalDebt() : 0;
  G.cash += (v.price - debt);
  G.debt = 0;
  if (G.loans) G.loans.forEach(l => { l.remain = 0; });
  G.sellInfo = { price: v.price, net: v.price - debt, month: G.month, stores: G.stores };
  G.status = 'sold';
  if ($('btnNext')) $('btnNext').disabled = true;
  if ($('btnOpen')) $('btnOpen').disabled = true;
  render();
}

/* ═══ v3.0.0 结算体验：打工还债流程 ═══ */
function enterDebtMode() {
  if (typeof startDebtMode !== 'function') return;
  const d = startDebtMode();
  if (!d) { G.status = 'bankrupt'; render(); return; }
  render();
}

function debtNextMonth() {
  if (typeof debtMonthAdvance !== 'function') return;
  const r = debtMonthAdvance();
  if (r && r.type === 'free') {
    $('endingPanel').innerHTML = `<div style="background:#141418;border:1px solid #3a3a40;padding:24px;text-align:center;color:#c0c0c0;line-height:2;max-width:560px;margin:12px auto">
      <div style="font-size:20px;color:#7fbf7f">债 清 了</div>
      <div style="font-size:13px;color:#999;margin-top:10px">用了 ${G.debtMode.months} 个月，还了 ${(G.debtMode.paid / 1e4).toFixed(1)} 万</div>
      <div style="font-size:13px;color:#8a8a8a;margin-top:10px">你走在街上，第一次觉得风是软的。</div>
      <button class="tbtn" style="margin-top:16px" onclick="location.reload()">重新开始</button>
    </div>`;
  } else {
    render();
  }
}

function giveUpDebt() {
  if (confirm('放弃还债，直接重开？')) location.reload();
}

function doSettle() {
  if (G.status !== 'running') return;   // 破产/被查处都不能继续

  // ═══ v3.1.0 按天模式：先只推进一天 ═══
  //  按月模式原样走下面那段（一字不改）
  if (G.pace === 'day') { doSettleDay(); return; }


  const log = settleMonth();

  // 展示本月明细
  let html = `<div class="logtitle">第 ${log.month} 个月</div>`;
  html += '<table class="detail">';
  log.items.forEach(([name, amt, kind]) => {
    if (kind === 'memo') return;
    const cls = kind === 'in' ? 'good' : 'bad';
    html += `<tr><td>${name}</td><td class="${cls}">${kind === 'in' ? '+' : '−'}${money(Math.abs(amt))}</td></tr>`;
  });
  html += `<tr class="total"><td>当月净利</td><td class="${log.netProfit >= 0 ? 'good' : 'bad'}">${money(log.netProfit)}</td></tr>`;
  html += '</table>';

  // ═══ v3.0.1 引导：人话诊断（老爹 01:34「稀里糊涂就死了」）═══
  //  真实创业者不是瞎蒙的，他看账、听员工、看隔壁
  //  所以这里把「这个月为什么赚/为什么亏」用人话说一遍
  if (typeof diagnoseMonth === 'function') {
    const diag = diagnoseMonth(log);
    if (diag.length) {
      html += `<div class="diagbox"><div class="diagtitle">📋 本月诊断</div>`;
      diag.forEach(line => { html += `<div class="diagline">${line}</div>`; });
      html += '</div>';
    }
  }

  // ═══ v3.0.1 引导：生存预警 ═══
  if (typeof survivalCheck === 'function') {
    const sv = survivalCheck();
    if (sv && !sv.healthy) {
      const cls = sv.level === 'critical' ? 'crit' : sv.level === 'danger' ? 'dang' : 'warn';
      html += `<div class="survivalbox ${cls}">${sv.text}</div>`;
    }
  }

  // ═══ v3.0.1 引导：开局前三月教程 ═══
  if (typeof tutorialFor === 'function') {
    const tut = tutorialFor(log.month);
    if (tut) {
      html += `<div class="tutbox"><div class="tuttitle">${tut.title}</div>`;
      tut.lines.forEach(l => { html += `<div class="tutline">${l}</div>`; });
      html += '</div>';
    }
  }

  // ═══ v3.0.1 引导：决策提示 ═══
  if (typeof decisionHints === 'function') {
    const hints = decisionHints();
    if (hints.length) {
      html += `<div class="hintbox"><div class="hinttitle">💭 提示</div>`;
      hints.forEach(h => { html += `<div class="hintline ${h.type}">${h.text}</div>`; });
      html += '</div>';
    }
  }

  // 随机事件（真实频率：约 35% 的月份会遇到事，不是月月出事）
  const EVENT_CHANCE = 0.35;
  const ev = (Math.random() < EVENT_CHANCE) ? pickEvent(G, new Set(G.usedEvents)) : null;
  if (ev) {
    G.usedEvents.push(ev.id);
    html += `<div class="event"><div class="evtitle">⚠ ${ev.title}</div><div class="evtext">${ev.text}</div></div>`;
    if (ev.choice) {
      choiceCtx = ev;
      html += '<div class="choices">';
      ev.options.forEach((o, i) => {
        html += `<button class="choice" onclick="pickChoice(${i})">${o.label}</button>`;
      });
      html += '</div>';
      $('btnNext').disabled = true;
    } else {
      const eff = ev.effect(G);
      applyEffect(eff);
      html += `<div class="evresult">→ ${eff.text}</div>`;
    }
  }

  // 历史大环境
  if (G.historyEvent && G.historyEvent.length) {
    G.historyEvent.forEach(h => {
      html += `<div class="bigEvent">
        <div class="betitle">🌏 ${h.name}（${h.severity}）</div>
        <div class="betext">${h.text}</div>
        ${h.real ? `<div class="bereal">真实数据：${h.real}</div>` : ''}
      </div>`;
    });
  }

  // 破产提示 / 事件
  log.events.forEach(e => {
    html += `<div class="evresult ${e.type}">${e.text}</div>`;
  });

  // 被查之后：先让玩家做选择，不选不能继续
  if (G.pendingAftermath) {
    html += renderAftermath();
  }
  if (G.pendingOfficialDemand) {
    html += renderOfficialDemand();
  }
  if (G.pendingFallout) {
    html += renderFallout();
  }

  $('log').innerHTML = html;
  render();
  if (G.pendingAftermath || G.pendingOfficialDemand || G.pendingFallout) $('btnNext').disabled = true;

  // ═══ v3.0.2 月报弹窗（老爹 01:36「弽窗就不用往下滑了」）═══
  //  把这个月的结果直接弹到眼前，不用滚到底部找
  showMonthModal(log, html);
}

/* ═══ v3.1.1 按天模式：推进一天（老爹 20261025）═══
 *  平时：把今天的流水贴进日志，数字刷新，不弹窗（弹一天一次会烦死人）
 *  月末：引擎返回月报（mode:'month'）→ 走原来那套月报弹窗 + 诊断，口径与按月模式一致
 */
function doSettleDay() {
  const log = settleDay();

  if (log && log.mode === 'month') {
    // ═══ 月末：直接复用按月模式的完整渲染（诊断/预警/教程/事件/弹窗）═══
    renderMonthLog(log);
    return;
  }

  // ═══ 日报：贴一条今日流水，刷新数字 ═══
  let html = `<div class="logtitle">第 ${G.month + 1} 月 · 第 ${log.dayOfMonth} 天</div>`;
  html += '<table class="detail">';
  (log.items || []).forEach(([name, amt, kind]) => {
    if (kind === 'memo') return;
    const cls = kind === 'in' ? 'good' : 'bad';
    html += `<tr><td>${name}</td><td class="${cls}">${kind === 'in' ? '+' : '−'}${money(Math.abs(amt))}</td></tr>`;
  });
  html += `<tr class="total"><td>今日净利</td><td class="${log.netProfit >= 0 ? 'good' : 'bad'}">${money(log.netProfit)}</td></tr>`;
  html += '</table>';

  // 今天的零碎事件
  (log.events || []).forEach(e => {
    html += `<div class="evresult ${e.type || ''}">${e.text}</div>`;
  });

  // 破产/停业提示
  if (G.status !== 'running') {
    html += `<div class="survivalbox crit">经营已结束：${G.status === 'bankrupt' ? '破产' : '退出'}</div>`;
  }

  $('log').innerHTML = html;
  render();
}

/* 把「一份月报 log」渲染到日志区 + 弹出月报卡片
 *  2026-10-25 从 doSettle 里抽出来，按月模式和按天模式的月末共用
 */
function renderMonthLog(log) {
  let html = `<div class="logtitle">第 ${log.month} 个月</div>`;
  html += '<table class="detail">';
  log.items.forEach(([name, amt, kind]) => {
    if (kind === 'memo') return;
    const cls = kind === 'in' ? 'good' : 'bad';
    html += `<tr><td>${name}</td><td class="${cls}">${kind === 'in' ? '+' : '−'}${money(Math.abs(amt))}</td></tr>`;
  });
  html += `<tr class="total"><td>当月净利</td><td class="${log.netProfit >= 0 ? 'good' : 'bad'}">${money(log.netProfit)}</td></tr>`;
  html += '</table>';

  if (typeof diagnoseMonth === 'function') {
    const diag = diagnoseMonth(log);
    if (diag.length) {
      html += `<div class="diagbox"><div class="diagtitle">📋 本月诊断</div>`;
      diag.forEach(line => { html += `<div class="diagline">${line}</div>`; });
      html += '</div>';
    }
  }

  if (typeof survivalCheck === 'function') {
    const sv = survivalCheck();
    if (sv && !sv.healthy) {
      const cls = sv.level === 'critical' ? 'crit' : sv.level === 'danger' ? 'dang' : 'warn';
      html += `<div class="survivalbox ${cls}">${sv.text}</div>`;
    }
  }

  if (typeof tutorialFor === 'function') {
    const tut = tutorialFor(log.month);
    if (tut) {
      html += `<div class="tutbox"><div class="tuttitle">${tut.title}</div>`;
      tut.lines.forEach(l => { html += `<div class="tutline">${l}</div>`; });
      html += '</div>';
    }
  }

  if (typeof decisionHints === 'function') {
    const hints = decisionHints();
    if (hints.length) {
      html += `<div class="hintbox"><div class="hinttitle">💭 提示</div>`;
      hints.forEach(h => { html += `<div class="hintline ${h.type}">${h.text}</div>`; });
      html += '</div>';
    }
  }

  log.events.forEach(e => {
    html += `<div class="evresult ${e.type}">${e.text}</div>`;
  });

  if (G.pendingAftermath) html += renderAftermath();
  if (G.pendingOfficialDemand) html += renderOfficialDemand();

  $('log').innerHTML = html;
  render();
  if (G.pendingAftermath || G.pendingOfficialDemand || G.pendingFallout) $('btnNext').disabled = true;

  showMonthModal(log, html);
}

/* 弹出月报卡片 */
function showMonthModal(log, html) {
  const mask = document.getElementById('monthModal');
  const body = document.getElementById('modalBody');
  const title = document.getElementById('modalTitle');
  if (!mask || !body) return;

  title.textContent = '第 ' + log.month + ' 个月';

  // 顶部三格概览：营收 / 净利 / 剩现金
  const cashCls = G.cash >= 0 ? '' : 'bad';
  const profitCls = log.netProfit >= 0 ? 'good' : 'bad';
  let sum = '<div class="modal-sum">' +
    '<div class="ms"><div class="k">营收</div><div class="v">' + money(log.revenue || 0) + '</div></div>' +
    '<div class="ms"><div class="k">净利</div><div class="v ' + profitCls + '">' + money(log.netProfit || 0) + '</div></div>' +
    '<div class="ms"><div class="k">现金</div><div class="v ' + cashCls + '">' + money(G.cash) + '</div></div>' +
    '</div>';

  // 默认收起明细表，只展示重点（诊断/预警/教程/事件）
  // 但表格部分是最原始的 html，这里在它上面加个折叠按钮
  const detailToggle = '<div style="text-align:right;margin-bottom:8px">' +
    '<button class="tiny" onclick="toggleModalDetail()" id="detailToggleBtn">展开明细</button></div>' +
    '<div id="modalDetail" style="display:none">';

  // html 开头是第一张明细表，把它包进折叠区
  const tableEnd = html.indexOf('</table>');
  let bodyContent;
  if (tableEnd > 0) {
    const tablePart = html.slice(0, tableEnd + 8);
    const rest = html.slice(tableEnd + 8);
    bodyContent = sum + detailToggle + tablePart + '</div>' + rest;
  } else {
    bodyContent = sum + html;
  }

  body.innerHTML = bodyContent;
  mask.classList.add('show');
  // v3.0.2：把弹窗里的选择按钮接上
  //  之前问题：事件选项渲染在 #log 里（底下），弹窗里看不到，玩家不知道怎么操作
  const footBtn = mask.querySelector('.modal-btn');
  if (footBtn) {
    const needChoice = !!(choiceCtx || G.pendingAftermath || G.pendingOfficialDemand || G.pendingFallout ||
                         G.pendingPeopleEvent || G.pendingLandlord);
    if (needChoice) {
      footBtn.disabled = true;
      footBtn.textContent = '⬆ 请先在上面做出选择';
    } else {
      footBtn.disabled = false;
      footBtn.textContent = G.status !== 'running' ? '查看结果' : '知道了，继续';
    }
  }
  // 若弹窗里有选择按钮，把底部按钮的状态同步一下
  body.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => { setTimeout(syncModalFoot, 50); });
  });
  setTimeout(syncModalFoot, 50);
}

/* 同步弹窗底部按钮状态 */
function syncModalFoot() {
  const mask = document.getElementById('monthModal');
  if (!mask) return;
  const footBtn = mask.querySelector('.modal-btn');
  if (!footBtn) return;
  const needChoice = !!(choiceCtx || G.pendingAftermath || G.pendingOfficialDemand || G.pendingFallout ||
                       G.pendingPeopleEvent || G.pendingLandlord);
  if (needChoice) {
    footBtn.disabled = true;
    footBtn.textContent = '⬆ 请先在上面做出选择';
  } else {
    footBtn.disabled = false;
    footBtn.textContent = G.status !== 'running' ? '查看结果' : '知道了，继续';
  }
}

function toggleModalDetail() {
  const d = document.getElementById('modalDetail');
  const b = document.getElementById('detailToggleBtn');
  if (!d) return;
  const open = d.style.display !== 'none';
  d.style.display = open ? 'none' : 'block';
  if (b) b.textContent = open ? '展开明细' : '收起明细';
}

function closeMonthModal() {
  const mask = document.getElementById('monthModal');
  if (mask) mask.classList.remove('show');
}

/* ═══ v3.0.5 面板互斥：点一个关掉别的，避免叠成一团 ═══ */
function closeAllPanels() {
  ['loanPanel','mortgagePanel','termsPanel','ipoPanel','reportPanel',
   'orgPanel','illegalPanel','switchPanel'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.style.display = 'none';
  });
}

/* 关掉报表面板（卖掉公司面板复用了 reportPanel） */
function closeReport() {
  const e = $('reportPanel');
  if (e) e.style.display = 'none';
}

/* ═══ v3.0.3 按钮按条件显示（老爹 01:39）═══
 * 原则：钱够/条件满足才出现，不够就折叠，不弹空面板
 * 玩家不该看到一堆点了没用的按钮
 */
function renderActions() {
  const p = P();
  const row1 = $('actRow1'), row2 = $('actRow2'), more = $('actMore');
  if (!row1 || !row2 || !more) return;

  const r1 = [], r2 = [], rm = [];

  // ── 开新店：现金够 80% 开店成本才显示 ──
  const openCost = p.setupCost * 0.8;
  if (G.cash >= openCost) {
    const maxPending = G.hasHQ ? 2 : 1;
    const busy = (G.pendingStores || []).length >= maxPending;
    r1.push('<button class="tbtn" id="btnOpen" onclick="doOpen()"' +
      (busy ? ' disabled style="opacity:.45"' : '') + '>' +
      (busy ? '🏗 筹备中…' : '🏗 开新店') + '</button>');
  }

  // ── 贷款：有可贷额度才显示 ──
  const avail = creditLimit() - totalDebt();
  if (avail > 10000) {
    r1.push('<button class="tbtn" onclick="showLoan()">💰 贷款 ' +
      (avail / 1e4).toFixed(0) + '万额度</button>');
  }

  // ── 换赛道：现金够转换成本才显示 ──
  const switchCost = G.stores * p.setupCost * 0.3;
  if (G.cash >= switchCost && G.stores >= 1) {
    r1.push('<button class="tbtn" onclick="showSwitch()">🔄 换赛道</button>');
  }

  // ── 组织：现金够建总部/公司化才显示 ──
  if (!G.hasHQ && G.cash >= 3000000) {
    r2.push('<button class="tbtn" onclick="showOrg()">🏢 建总部</button>');
  } else if (G.hasHQ && !G.hasCompany && G.cash >= 8000000) {
    r2.push('<button class="tbtn" onclick="showOrg()">🏛️ 公司化</button>');
  }

  // ── 抵押：有待抵押资产才显示 ──
  const hasCollateral = (G.stores >= 1) && (G.mortgages || []).length < 2;
  if (hasCollateral) {
    r2.push('<button class="tbtn" onclick="showMortgage()">🏠 抵押</button>');
  }

  // ── 上市：满足条件才显示 ──
  if (!G.listed && typeof ipoEligibility === 'function') {
    const el = ipoEligibility();
    if (el && el.ok) {
      r2.push('<button class="tbtn" style="border-color:#3a6a3a;color:#80c080" onclick="showIPO()">📈 上市</button>');
    }
  }

  // ── 更多（折叠区）：账期/违法这些不常用或敏感的 ──
  rm.push('<button class="tbtn" onclick="showTerms()">📦 账期</button>');
  if (G.stores >= 5) {
    rm.push('<button class="tbtn" style="border-color:#5a2a2a;color:#c08080" onclick="showIllegal()">⚠️ 违规操作</button>');
  }

  row1.innerHTML = r1.join('');
  row2.innerHTML = r2.join('');

  // 更多：默认折叠
  if (rm.length) {
    more.innerHTML = '<div class="actions" style="margin-top:2px">' +
      '<button class="tbtn" style="opacity:.7;font-size:10px" onclick="toggleMore()">' +
      (G.moreOpen ? '收起 ▲' : '更多选项 ▼') + '</button>' +
      (G.moreOpen ? rm.join('') : '') +
      '</div>';
  } else {
    more.innerHTML = '';
  }
}

function toggleMore() {
  G.moreOpen = !G.moreOpen;
  renderActions();
}

function applyEffect(eff) {
  if (eff.cash) G.cash += eff.cash;
  if (eff.reputation) G.reputation = Math.max(0, Math.min(100, G.reputation + eff.reputation));
  if (eff.morale) G.morale = Math.max(0, Math.min(100, G.morale + eff.morale));
  if (eff.revenueDelta) addMod('revenueDelta', eff.revenueDelta, eff.months || 1);
  if (eff.foodCostDelta) addMod('foodCostDelta', eff.foodCostDelta, eff.months || 1);
  if (eff.rentDelta) addMod('rentDelta', eff.rentDelta, eff.months || 999);
  if (eff.staffRateDelta) addMod('staffRateDelta', eff.staffRateDelta, eff.months || 999);
  if (eff.staffDelta) addMod('staffDelta', eff.staffDelta, eff.months || 999);
  if (eff.receivables) {
    eff.receivables.forEach(r => G.receivables.push(r));
  }
  if (G.cash < 0) G.status = 'bankrupt';
}

function pickChoice(i) {
  if (!choiceCtx) return;
  const eff = choiceCtx.options[i].effect(G);
  applyEffect(eff);
  const box = document.querySelector('.choices');
  if (box) box.outerHTML = `<div class="evresult">→ ${eff.text}</div>`;
  choiceCtx = null;
  $('btnNext').disabled = false;
  render();
}

function doOpen() {
  const r = openStore();
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  render();
}

/* 打开贷款面板 */
function showLoan() {
  const panel = $('loanPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;
  const limit = creditLimit();
  const debt = totalDebt();
  const avail = Math.max(0, limit - debt);
  const rate = loanRate();

  let html = `<div class="loanhead">信用评分 <b class="${G.credit >= 70 ? 'good' : G.credit >= 40 ? 'warn2' : 'bad'}">${G.credit.toFixed(0)}</b> / 100
    · 可贷余额 <b>${money(avail)}</b> · 基准利率 <b>${(G.lastRBI).toFixed(2)}%</b></div>`;

  // 已有贷款
  if (G.loans.length) {
    html += '<div class="loansub">当前贷款</div>';
    G.loans.forEach((ln, i) => {
      const r = ln.rate / 12, n = ln.term;
      const pay = ln.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      html += `<div class="loanrow">
        <span>${ln.product} · 余 ${money(ln.remain)} · 年化 ${(ln.rate * 100).toFixed(2)}%</span>
        <span class="pay">月供 ${money(pay)}</span>
        <button class="tiny" onclick="doRepay(${i})">提前还</button>
      </div>`;
    });
  }

  // 可申请的贷款
  html += '<div class="loansub">可申请</div>';
  LOAN_PRODUCTS.forEach(prod => {
    const okCredit = G.credit >= prod.minCredit;
    const okMonth = prod.id !== 'business' || G.month >= 6;
    const okAmount = avail >= 50000;
    const disabled = !okCredit || !okMonth || !okAmount;
    let reason = '';
    if (!okCredit) reason = '信用不足（需 ' + prod.minCredit + ' 分）';
    else if (!okMonth) reason = '需经营满 6 个月';
    else if (!okAmount) reason = '可贷余额不足';

    html += `<div class="loanprod ${disabled ? 'disabled' : ''}">
      <div class="lpname">${prod.name} <span class="lpterm">${prod.term} 期</span></div>
      <div class="lpdesc">${prod.desc}</div>
      ${disabled ? `<div class="lpno">${reason}</div>` : `
        <div class="lprate">年利率 ${(rate * 100).toFixed(2)}%</div>
        <div class="lpbtns">
          ${[5, 10, 20].filter(w => w * 1e4 <= avail).map(w =>
            `<button class="tiny" onclick="doLoan('${prod.id}',${w * 1e4})">借 ${w} 万</button>`).join('')}
        </div>`}
    </div>`;
  });

  html += `<div class="loanwarn">⚠️ 利率随信用浮动：信用越低越贵。逾期一次罚息 5% 并扣 15 分信用。</div>`;
  panel.innerHTML = html;
}

function doLoan(prodId, amount) {
  const r = applyLoan(prodId, amount);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showLoan(); showLoan();   // 刷新面板
  render();
}

function doRepay(idx) {
  const ln = G.loans[idx];
  if (!ln) return;
  const r = repayLoan(idx, ln.remain);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showLoan(); showLoan();
  render();
}

function showSwitch() {
  // ═══ v3.0.5 修复（老爹 01:42「换赛道点了没反应」）═══
  //  根因：HTML 里 switchPanel 是空容器，没有 switchList 子元素
  //        showSwitch 找不到 switchList 就直接 return，点了什么都不发生
  //  改法：直接用 switchPanel 作为容器，同时「点一个关掉别的面板」
  closeAllPanels();
  const panel = $('switchPanel');
  if (!panel) return;
  panel.style.display = 'block';
  panel.innerHTML = '<div class="loanhead">换赛道 · 转换成本与成功率</div>' +
    '<div id="switchList"></div>';
  const list = $('switchList');
  list.innerHTML = Object.entries(SEGMENTS).map(([k, v]) => {
    if (k === G.seg) return '';
    const prev = switchSegment(k);
    const cls = prev.ok ? '' : 'disabled';
    return `<div class="switem ${cls}">
      <div class="swname">${v.icon} ${v.name}</div>
      <div class="swdesc">${v.desc}</div>
      ${prev.ok ? `<div class="swcost">转换成本 ${money(prev.cost)} · 成功率 ${pct(prev.successRate)}</div>
      <button class="tbtn" onclick="confirmSwitch('${k}')">转做这个</button>` : `<div class="swcost bad">${prev.msg}</div>`}
    </div>`;
  }).join('');
}

function confirmSwitch(k) {
  const prev = switchSegment(k);
  if (!prev.ok) return;
  const r = executeSwitch(k, prev);
  $('switchPanel').style.display = 'none';
  $('log').innerHTML = `<div class="evresult ${r.success ? 'good' : 'bad'}">${r.msg}</div>`;
  render();
}

function startGame() {
  const seg = document.querySelector('input[name=seg]:checked').value;
  const cityId = $('selCity').value;
  const distId = $('selDist').value;
  const p = SEGMENTS[seg];

  // 城市系数
  const cm = cityModifiers(cityId, distId);
  G.cityMod = cm;
  G.cityId = cityId;
  G.districtId = distId;
  G.startYear = startYear;

  // 起始资金：开店成本 + 1~2 个月固定成本，按城市等级加成（一线融资更容易，但压力也大）
  const monthlyFixed = (p.rentFixed * cm.rentMult) + p.utilFixed +
                       (p.staffCount * p.staffFixedWage * cm.wageMult);
  const bonus = CITY_STARTUP_BONUS[cm.city.tier] || 1.0;
  G.cash = Math.round((p.setupCost + monthlyFixed * (1 + Math.random())) * bonus / 10000) * 10000;

  // 加盟：先扣加盟费
  let franchiseMsg = '';
  if (startMode === 'join' && startBrand) {
    const r = joinFranchise(startBrand);
    franchiseMsg = r.ok ? r.msg : ('加盟失败：' + r.msg);
  }

  // 基础状态
  G.seg = seg;
  G.stores = 1;
  G.month = 0;
  G.history = [];
  G.status = 'running';

  // ═══ v3.1.0 按天推进：节奏模式 + 日计数 ═══
  G.pace = (typeof paceMode !== 'undefined' && paceMode) ? paceMode : 'month';
  G.day = 0;        // 当月第几天
  G.dayIdx = 0;     // 从开局起第几天
  G.accMonth = null;
  G.effStores = 1;
  G.mods = [];
  G.receivables = [];
  G.payables = [];
  G.reputation = 62;   // v3.0.0 修复（01:00）：跟引擎默认一致，50 太低会把营收拉塞
  G.morale = 70;
  G.monthsNegProfit = 0;
  G.loans = [];
  G.credit = 100;
  G.overdue = 0;
  G.lastRBI = 6.0;
  // ═══ v3.0.0 新增字段初始化（否则上一局残留会带进新局）═══
  G.fixedAssetsGross = p.setupCost;      // 开局第一家店的固定资产原值
  G.accumDepreciation = 0;
  G.deposits = Math.round(p.rentFixed * cm.rentMult * 3);   // 房租押金 3 个月
  G.arrears = 0;
  G.covenantWatch = false;
  G.debtCheck = null;
  G.stockPolicy = 'normal';
  G.inventory = 0;
  G.foodCostLast = 0;
  G.entropyLoss = 0;
  G.hasRelativeManager = false;
  G.relativeMonths = 0;
  G.familyPressure = 0;
  G.partner = null;
  G.bigCustomer = null;
  G.platformRate = 0.18;
  G.supplierMode = 'single';
  G.hasInsurance = false;
  G.insuranceMonthly = 0;
  G.pandemicHit = false;
  G.disaster = null;
  G.debtMode = null;
  G.pendingPeopleEvent = null;
  G.pendingLandlord = null;
  G.loanShark = null;
  G.hasOutsideExec = false;
  G.execMonthly = 0;
  G.crimes = [];
  G.caughtBy = null;
  G.priceWar = null;
  G.priceWarHistory = [];
  if (typeof initPartner === 'function') initPartner();
  G.mortgages = [];
  G.terms = 'normal';
  G.listed = false;
  G.ipoMonth = 0;
  G.ownership = 1.0;
  G.monthlyDividend = false;
  G.hasHQ = false;
  G.hasCompany = false;
  G.riskBuildup = 0;
  G.riskEvent = null;
  G.vcDeal = null;
  G.pendingStores = [];
  G.rampingStores = [{ months: 0, rampMonths: 10 }];   // 第一家店也要爬坡
  G.rivalsPriceWarMonths = 0;
  G.warnings = [];
  G.historyEvent = null;
  G.staff = p.staffCount;
  if (startMode !== 'join') G.franchise = null;

  // 竞争对手
  initRivals(cityId, distId, seg);

  $('setup').style.display = 'none';
  $('game').style.display = 'block';
  render();

  const hist = historyRevenueMult(0, startYear);
  $('log').innerHTML = `<div class="evresult good">
    ${cm.city.name} · ${cm.district.name} · ${startYear} 年 · ${p.name}
    ${G.franchise ? '（加盟「' + G.franchise.brandName + '」）' : '（自建品牌）'}<br>
    现金 ${money(G.cash)}｜员工 ${G.staff} 人｜附近有 ${G.rivals.length} 家同行<br>
    ${franchiseMsg ? franchiseMsg + '<br>' : ''}
    <span style="color:#8aa06a">${p.realData}</span><br>
    <span style="color:#c0a050">⚠️ 新店要 10 个月才能爬满客流，前几个月是熬的</span>
  </div>`;
}


/* ═══ 抵押面板 ═══ */
function showMortgage() {
  const panel = $('mortgagePanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  let html = `<div class="loanhead">可抵押资产 · 折价率越低越难变现</div>`;
  COLLATERAL_TYPES.forEach(t => {
    const offer = mortgageOffer(t.id);
    if (!offer || !offer.ok) {
      html += `<div class="loanprod disabled">
        <div class="lpname">${t.name}</div>
        <div class="lpdesc">${t.desc}</div>
        <div class="lpno">${offer ? offer.msg : '无'}</div></div>`;
      return;
    }
    const already = G.mortgages.some(m => m.type === t.id);
    html += `<div class="loanprod ${already ? 'disabled' : ''}">
      <div class="lpname">${t.name} <span class="lpterm">折价 ${(t.ratio * 100)}%</span></div>
      <div class="lpdesc">${t.desc}</div>
      <div class="lprate">评估 ${money(offer.baseValue)} → 可贷 ${money(offer.loanable)} · 年化 ${(offer.rate * 100).toFixed(2)}%</div>
      ${already ? '<div class="lpno">已抵押</div>' : `
        <div class="lpbtns">
          ${[0.5, 1].map(f => `<button class="tiny" onclick="doMortgage('${t.id}',${Math.round(offer.loanable * f)})">借 ${money(offer.loanable * f)}</button>`).join('')}
        </div>`}
    </div>`;
  });
  html += `<div class="loanwarn">⚠️ 抵押贷利率比信用贷低，但一旦长期违约，银行会按评估价 50% 法拍处置抵押物。</div>`;
  panel.innerHTML = html;
}

function doMortgage(typeId, amount) {
  const r = applyMortgage(typeId, amount);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showMortgage(); showMortgage();
  render();
}

/* ═══ 账期谈判面板 ═══ */
function showTerms() {
  const panel = $('termsPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  const cur = currentDeal();
  const sizeScore = Math.min(1, G.stores / 10);
  const creditScore = G.credit / 100;
  const power = sizeScore * 0.5 + creditScore * 0.5;

  let html = `<div class="loanhead">当前账期 <b>${cur.name}</b> · 议价力 <b class="${power >= 0.6 ? 'good' : power >= 0.35 ? 'warn2' : 'bad'}">${(power * 100).toFixed(0)}</b> / 100
    <br><span style="font-size:9px;color:#5a7a90">议价力 = 门店规模 50% + 信用 50%</span></div>`;

  TERMS_DEALS.forEach(d => {
    const isCur = d.id === G.terms;
    const need = d.id === 'extra' ? 0.6 : d.id === 'long' ? 0.35 : 0;
    const canGet = power >= need;
    html += `<div class="loanprod ${(!canGet || isCur) ? 'disabled' : ''}">
      <div class="lpname">${d.name} ${isCur ? '<span class="lpterm">当前</span>' : ''}</div>
      <div class="lpdesc">${d.desc}</div>
      <div class="lprate">报价 ${d.priceUp >= 0 ? '+' : ''}${(d.priceUp * 100).toFixed(0)}%${d.risk > 0 ? ` · 断供风险 ${(d.risk * 100).toFixed(0)}%` : ''}</div>
      ${isCur ? '' : canGet ? `<div class="lpbtns"><button class="tiny" onclick="doTerms('${d.id}')">谈这个</button></div>` :
        `<div class="lpno">议价力不足（需 ${(need * 100).toFixed(0)} 分）</div>`}
    </div>`;
  });
  html += `<div class="loanwarn">⚠️ 账期越长，占用供应商的钱越多，但报价更贵；经营一旦恶化，供应商会直接断供。</div>`;
  panel.innerHTML = html;
}

function doTerms(id) {
  const r = negotiateTerms(id);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showTerms(); showTerms();
  render();
}

/* ═══ 上市面板 ═══ */
function showIPO() {
  const panel = $('ipoPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  if (G.listed) {
    const el2 = ipoEligibility();
    panel.innerHTML = `<div class="loanhead">已上市 · 创始人持股 <b class="good">${((G.ownership || 1) * 100).toFixed(1)}%</b>
      <br>当前估值约 ${money(el2.valuation)} · 上市后每期分红净利的 30%</div>`;
    return;
  }

  const el = ipoEligibility();
  let html = `<div class="loanhead">上市条件检查 · 预计估值 <b>${money(el.valuation)}</b></div>`;
  el.checks.forEach(c => {
    html += `<div class="loanrow">
      <span>${c.ok ? '✅' : '❌'} ${c.name}</span>
      <span class="pay" style="color:${c.ok ? '#50c080' : '#c06060'}">${c.now} / 需 ${c.need}</span>
    </div>`;
  });

  if (el.pass) {
    html += `<div class="loanprod">
      <div class="lpname">选择发行比例</div>
      <div class="lpdesc">发行股份换取现金。发行越多募资越多，但创始人股权稀释越多，且发行费占 8%</div>
      <div class="lpbtns">
        ${[0.15, 0.25, 0.35].map(r => `<button class="tiny" onclick="doIPOClick(${r})">发行 ${(r * 100)}% · 募 ${money(el.valuation * r)}</button>`).join('')}
      </div>
    </div>`;
  } else {
    html += `<div class="loanwarn">还没到上市的时候。继续把店做多、利润做厚、信用守住。</div>`;
  }
  panel.innerHTML = html;
}

function doIPOClick(ratio) {
  const r = doIPO(ratio);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showIPO(); showIPO();
  render();
}

/* ═══ 经营报表 ═══ */
function showReport() {
  const panel = $('reportPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  const p = P();
  const h12 = G.history.slice(-12);
  const rev = h12.reduce((s, h) => s + (h.revenue || 0), 0);
  const profit = h12.reduce((s, h) => s + (h.netProfit || 0), 0);
  const assets = G.stores * p.setupCost * 0.7;
  const debt = totalDebt();
  const netWorth = G.cash + assets - debt;
  const months = h12.length || 1;

  let html = `<div class="loanhead">最近 ${months} 个月经营情况</div>`;
  html += `<table class="detail" style="width:100%">
    <tr><td>累计营收</td><td class="${rev >= 0 ? 'good' : 'bad'}">${money(rev)}</td></tr>
    <tr><td>累计净利</td><td class="${profit >= 0 ? 'good' : 'bad'}">${money(profit)}</td></tr>
    <tr><td>月均净利</td><td class="${profit >= 0 ? 'good' : 'bad'}">${money(profit / months)}</td></tr>
    <tr><td>净利率</td><td>${rev ? ((profit / rev) * 100).toFixed(1) + '%' : '-'}</td></tr>
  </table>`;
  html += `<div class="loansub">资产负债</div>
  <table class="detail" style="width:100%">
    <tr><td>现金</td><td>${money(G.cash)}</td></tr>
    <tr><td>门店资产（折旧后）</td><td>${money(assets)}</td></tr>
    <tr><td>负债合计</td><td class="bad">${money(debt)}</td></tr>
    <tr class="total"><td>净资产</td><td class="${netWorth >= 0 ? 'good' : 'bad'}">${money(netWorth)}</td></tr>
    <tr><td>资产负债率</td><td>${assets > 0 ? ((debt / (assets + G.cash)) * 100).toFixed(1) + '%' : '-'}</td></tr>
  </table>`;
  html += `<div class="loansub">经营指标</div>
  <table class="detail" style="width:100%">
    <tr><td>门店数 / 阶段</td><td>${G.stores} 家 · ${(STAGES.find(s => G.stores >= s.minStores && G.stores <= s.maxStores) || STAGES[0]).name}</td></tr>
    <tr><td>员工数</td><td>${G.staff} 人</td></tr>
    <tr><td>口碑 / 士气</td><td>${G.reputation.toFixed(0)} / ${G.morale.toFixed(0)}</td></tr>
    <tr><td>信用评分</td><td>${G.credit.toFixed(0)} 分</td></tr>
    <tr><td>供应商账期</td><td>${currentDeal().name}</td></tr>
    <tr><td>上市状态</td><td>${G.listed ? '已上市（创始持股 ' + ((G.ownership || 1) * 100).toFixed(1) + '%）' : '未上市'}</td></tr>
  </table>`;
  panel.innerHTML = html;
}

/* ═══ 开局界面：城市 / 年份 / 创业或加盟 ═══ */
let startMode = 'start';
let startBrand = null;
let startYear = 2019;
let paceMode = 'month';   // v3.1.1 结算节奏：month=按月 / day=按天

/* v3.1.1 开局面板切换结算节奏（老爹 20261025） */
function setPace(mode) {
  paceMode = (mode === 'day') ? 'day' : 'month';
  const m = document.getElementById('paceMonth');
  const d = document.getElementById('paceDay');
  if (m) m.classList.toggle('active', paceMode === 'month');
  if (d) d.classList.toggle('active', paceMode === 'day');
}

function initSetup() {
  // 城市下拉
  const sel = $('selCity');
  if (!sel) return;
  const byTier = {};
  CITIES.forEach(c => { (byTier[c.tier] = byTier[c.tier] || []).push(c); });
  let html = '';
  ['tier1','newtier1','tier2','tier3'].forEach(t => {
    if (!byTier[t]) return;
    html += `<optgroup label="${CITY_TIERS[t].name}">`;
    byTier[t].forEach(c => { html += `<option value="${c.id}">${c.name}</option>`; });
    html += '</optgroup>';
  });
  sel.innerHTML = html;
  sel.value = 'cd';

  // 年份按钮
  $('yearBox').innerHTML = START_YEARS.map(y =>
    `<button class="ybtn${y.year === startYear ? ' active' : ''}" onclick="pickYear(${y.year})">
      ${y.label}<span class="yd">${y.difficulty}</span>
    </button>`).join('');

  onCityChange();
  renderBrands();
}

function pickYear(y) {
  startYear = y;
  document.querySelectorAll('.ybtn').forEach(b => b.classList.remove('active'));
  event.target.closest('.ybtn').classList.add('active');
}

function onCityChange() {
  const cityId = $('selCity').value;
  const distId = $('selDist').value;
  const m = cityModifiers(cityId, distId);
  if (!m) return;
  $('cityInfo').innerHTML =
    `<b>${m.city.name} · ${m.tier.name} · ${m.district.name}</b><br>
     人口 ${m.city.pop} 万｜人均可支配收入 ${(m.city.income / 10000).toFixed(1)} 万/年<br>
     推算餐饮市场约 <b>${m.diningMarket} 亿</b>（人口 × 收入 × 25% 餐饮占比）<br>
     核心商圈参考租金 <b>${m.refRent} 元/㎡/天</b><br>
     经营系数：租金 ×${m.rentMult.toFixed(2)}｜客流 ×${m.revenueMult.toFixed(2)}｜竞争 ×${m.compMult.toFixed(2)}｜工资 ×${m.wageMult.toFixed(2)}<br>
     <span style="color:#5a7a90">${m.city.note}</span><br>
     <span style="color:#4a6a80;font-size:8px">人口/收入为公开统计年鉴数据；餐饮规模与租金按公开行业规律推算，非逐城实测</span>`;
}

function setMode(mode) {
  startMode = mode;
  $('modeStart').classList.toggle('active', mode === 'start');
  $('modeJoin').classList.toggle('active', mode === 'join');
  $('brandBox').style.display = mode === 'join' ? 'block' : 'none';
  renderBrands();
}

function renderBrands() {
  if (startMode !== 'join') return;
  const seg = document.querySelector('input[name=seg]:checked').value;
  const list = brandsFor(seg);
  // ═══ v3.0.6 修复（老爹 01:43「色标把老底全说了，傻子都知道选哪个」）═══
  //  真实招商：好的一面摆在明面，坑藏在合同细则里
  //  改法：① 去掉全部绿/红判定色，一律中性
  //        ② 只给原始数字，不给「好/差」结论
  //        ③ 供货加价这种关键信息收进「详细条款」，要点开才看
  $('brandBox').innerHTML =
    `<div class="setup-title" style="margin:12px 0 8px">选牌子（信息这里都有，自己算）</div>` +
    list.map(b => `
      <div class="brandcard${startBrand === b.id ? ' active' : ''}" onclick="pickBrand('${b.id}')">
        <div class="bname">${b.name}</div>
        <div class="bdesc">${b.desc}</div>
        <div class="bsign">
          加盟费 ${(b.fee / 1e4).toFixed(0)} 万｜保证金 ${(b.deposit / 1e4).toFixed(0)} 万｜权利金 营收 ${(b.royalty * 100).toFixed(0)}%<br>
          商务部备案：${b.sign.备案 ? '有' : '查不到'}｜直营店：${b.sign.直营店} 家｜加盟商评价：${b.sign.加盟商评价} 分
        </div>
        <div class="bdetail-toggle" onclick="event.stopPropagation();toggleBrandDetail('${b.id}')">
          <span id="btog-${b.id}">查看详细条款 ▾</span>
        </div>
        <div class="bdetail" id="bdet-${b.id}" style="display:none">
          供货价：${b.sign.供货价}<br>
          合同期限：3 年｜续约：需总部同意｜提前解约：加盟费不退<br>
          总部支持：培训 ${b.tier === 'good' ? '7' : b.tier === 'meh' ? '3' : '1'} 天｜督导巡店：${b.tier === 'good' ? '每月' : b.tier === 'meh' ? '季度' : '不固定'}
        </div>
      </div>`).join('');
}

function toggleBrandDetail(id) {
  const el = document.getElementById('bdet-' + id);
  const tog = document.getElementById('btog-' + id);
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (tog) tog.textContent = open ? '查看详细条款 ▾' : '收起条款 ▴';
}

function pickBrand(id) {
  startBrand = id;
  renderBrands();
  // ═══ v3.0.7（老爹 01:45）：点牌子先弹合同，仔细看才不吃亏 ═══
  if (typeof showContract === 'function') showContract(id);
}

/* ═══ 组织建设面板 ═══ */
function showOrg() {
  const panel = $('orgPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  const risk = G.riskBuildup || 0;
  let html = `<div class="loanhead">当前风险累积 <b class="${risk >= 30 ? 'bad' : risk >= 15 ? 'warn2' : 'good'}">${risk.toFixed(0)}</b>
    ${risk >= 30 ? '（高危！随时可能集中爆发）' : risk >= 15 ? '（有隐患）' : '（安全）'}</div>`;

  ORG_LEVELS.forEach(lv => {
    const built = G[lv.flag];
    const chk = checkOrg(lv.id);
    html += `<div class="loanprod ${built ? 'disabled' : ''}">
      <div class="lpname">${lv.icon} ${lv.name} <span class="lpterm">建议 ${lv.suggestStores} 家店时</span></div>
      <div class="lpdesc">${lv.desc}</div>
      <div class="lprate">投入 ${(lv.cost / 1e4).toFixed(0)} 万 · 每月固定 ${(lv.monthly / 1e4).toFixed(0)} 万</div>
      ${built ? '<div class="lpno" style="color:#50c080">✓ 已建成</div>' : `
        <div style="font-size:9px;color:#7a94ac;line-height:1.8;margin:5px 0">
          <span style="color:#50c080">建了：</span>${lv.benefits.join('、')}<br>
          <span style="color:#c06060">不建：</span>${lv.skipCost.join('、')}
        </div>
        ${chk.ok ? `<div class="lpbtns"><button class="tiny" onclick="doBuildOrg('${lv.id}')">投入 ${(lv.cost / 1e4).toFixed(0)} 万建${lv.name}</button></div>`
                 : `<div class="lpno">${chk.msg}</div>`}
      `}
    </div>`;
  });

  html += `<div class="loanwarn">⚠️ 不建不是不花钱，是把钱换成了风险。风险累积到 30 以上，随时会集中爆发——突击检查、食安事故、大客户解约。</div>`;
  panel.innerHTML = html;
}

function doBuildOrg(id) {
  const r = buildOrg(id);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showOrg(); showOrg();
  render();
}

/* ═══ 对赌面板（并入上市面板） ═══ */
function showVC() {
  const panel = $('ipoPanel');
  panel.style.display = 'block';
  if (G.vcDeal && !G.vcDeal.done) {
    const d = G.vcDeal;
    panel.innerHTML = `<div class="loanhead">已签「${d.name}」· 第 ${d.deadline} 月到期
      <br>目标：${d.targetStores ? '开到 ' + d.targetStores + ' 家店　' : ''}年净利 ≥ ${(d.targetProfit / 1e4).toFixed(0)} 万
      <br>失败代价：按 ${(d.multiple * 100).toFixed(0)}% 回购（${((d.amount * d.multiple) / 1e4).toFixed(0)} 万）</div>
      <div class="loanwarn">⚠️ 赔不起就丢控制权——俏江南张兰走过的路</div>`;
    return;
  }
  panel.innerHTML = `<div class="loanhead">对赌融资：拿投资人的钱，签业绩承诺</div>` +
    VC_OFFERS.map(o => `<div class="loanprod">
      <div class="lpname">${o.name}</div>
      <div class="lpdesc">${o.desc}</div>
      <div class="lprate">拿到 ${(o.amount / 1e4).toFixed(0)} 万 · 出让 ${(o.equity * 100).toFixed(0)}% 股权 · 期限 ${o.years} 年</div>
      <div class="lpbtns"><button class="tiny" onclick="doVC('${o.id}')">签这个</button></div>
    </div>`).join('') +
    `<div class="loanwarn">⚠️ 对赌是真实存在的玩法。签了字，做不到就是真赔。</div>`;
}

function doVC(id) {
  const r = takeVCD(id);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'good' : 'bad'}">${r.msg}</div>`;
  showVC(); showVC();
  render();
}

/* ═══ 违法操作面板 ═══ */
function showIllegal() {
  const panel = $('illegalPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  if (panel.style.display !== 'block') return;

  let html = `<div class="loanhead" style="color:#c06060">⚠️ 这些操作短期能省钱，但风险月月累积</div>`;
  ILLEGAL_ACTS.forEach(a => {
    const on = G.illegalActs && G.illegalActs[a.id];
    const months = (G.illegalRisk && G.illegalRisk[a.id]) || 0;
    const curRisk = (a.baseRisk + a.riskGrowth * Math.pow(months, a.riskCurve || 2)) * 100;
    html += `<div class="loanprod ${on ? 'activeIllegal' : ''}">
      <div class="lpname">${a.icon} ${a.name} ${on ? '<span class="lpterm" style="color:#c06060">使用中</span>' : ''}</div>
      <div class="lpdesc">${a.desc}</div>
      <div class="lprate">
        ${a.savingRate ? '省 ' + (a.savingRate * 100).toFixed(0) + '% ' + (a.id === 'oil' ? '食材' : a.id === 'labor' ? '人工' : '营收') : ''}
        ${a.revenueBoost ? '客流 +' + (a.revenueBoost * 100).toFixed(0) + '%' : ''}
        ${on ? ' ｜ 当前月被查概率 <b style="color:' + (curRisk > 8 ? '#e05050' : '#d0a040') + '">' + curRisk.toFixed(1) + '%</b>' : ''}
      </div>
      <div class="lpbtns">
        <button class="tiny ${on ? 'danger' : ''}" onclick="doToggleIllegal('${a.id}')">${on ? '停用' : '启用'}</button>
      </div>
    </div>`;
  });
  html += `<div class="loanwarn" style="color:#c06060">
    🚨 被查处后果：<br>
    · 劣质油 → 刑事案，吊照关停，<b>游戏直接结束</b><br>
    · 偷税 → 补缴+罚款，金额巨大可追刑责<br>
    · 黑工 → 停产停业、吊销执照，<b>游戏直接结束</b><br>
    · 刷单 → 罚款、平台降权<br><br>
    用得越久，查得越准。这不是能不能做的问题，是赌不赌得起。
  </div>`;
  panel.innerHTML = html;
}

function doToggleIllegal(id) {
  const r = toggleIllegal(id);
  $('log').innerHTML = `<div class="evresult ${r.ok ? 'warn' : 'bad'}">${r.msg}</div>`;
  showIllegal(); showIllegal();
  render();
}

/* ═══ 被查之后：四条路怎么走 ═══ */
function renderAftermath() {
  const pa = G.pendingAftermath;
  if (!pa) return '';

  let html = `<div class="bigEvent" style="border-color:#8a2020;background:#1e0a0a">
    <div class="betitle" style="color:#ff6060">🚨 「${pa.actName}」被查了 —— 接下来怎么办？</div>
    <div class="betext">罚款基数约 ${money(pa.baseFine)}。怎么应对，决定公司还能不能开下去。</div>
    <div class="choices">`;
  pa.choices.forEach(c => {
    html += `<button class="choice" onclick="pickAftermath('${c.id}')">
      <b>${c.name}</b><br><span style="color:#7a94ac;font-size:9px">${c.desc}</span>
    </button>`;
  });
  html += `</div></div>`;
  return html;
}

function pickAftermath(choiceId) {
  const pa = G.pendingAftermath;
  if (!pa) return;
  const r = resolveAftermath(pa.actId, choiceId);
  G.pendingAftermath = null;

  $('log').innerHTML = `<div class="evresult ${r.gameOver ? 'bad' : 'warn'}">${r.text}</div>`;
  $('btnNext').disabled = (G.status !== 'running');
  render();
}

/* ═══ 官员来要钱：给还是不给 ═══ */
function renderOfficialDemand() {
  if (!G.pendingOfficialDemand || !G.official || !G.official.active) return '';
  const amt = G.pendingOfficialDemand;
  const o = G.official;
  return `<div class="bigEvent" style="border-color:#8a6a20;background:#1e1a0a">
    <div class="betitle" style="color:#e0b050">💸 那位官员又来"借"钱了</div>
    <div class="betext">
      这次要 <b>${money(amt)}</b>。关系亲密度 ${o.relation.toFixed(0)}/100，累计已给 ${money(o.totalPaid)}。<br>
      给：关系更铁，但他下次要得更多（真实：胃口会变大）<br>
      不给：关系裂一道缝，对方可能恼羞成怒
    </div>
    <div class="choices">
      <button class="choice" onclick="answerOfficial(true)">给钱（${money(amt)}）</button>
      <button class="choice" onclick="answerOfficial(false)">不给</button>
    </div>
  </div>`;
}

function answerOfficial(yes) {
  const r = payOfficial(yes);
  G.pendingOfficialDemand = null;
  $('log').innerHTML = `<div class="evresult ${r.gameOver ? 'bad' : 'warn'}">${r.text}</div>`;
  $('btnNext').disabled = (G.status !== 'running');
  render();
}

/* ═══ v3.2.0 结局二：官员落马后的「跑与不跑」═══
 * 真实概率（老爹定）：
 *   成功跑掉 1% —— 不管有没有提前铺路，都是 1%
 *   跑到半路被抓 50%
 *   剩下 49% —— 还没跑出门就被盯上
 */
function renderFallout() {
  if (!G.pendingFallout) return '';
  return `<div class="bigEvent" style="border-color:#8a2a2a;background:#1e0a0a">
    <div class="betitle" style="color:#e05050">🚨 专案组明天上门</div>
    <div class="betext">
      那位官员的账本上有你的名字，累计打点 <b>${money((G.fallout && G.fallout.totalPaid) || 0)}</b>。<br>
      现在只剩两条路：<br>
      <b>跑</b>——收拾东西，今晚就走。<br>
      <b>不跑</b>——留下来，等他们把门敲开。<br>
      <span style="color:#8a8a8a;font-size:11px">（跑的人，十个里有九个都提前铺好了路。没用。）</span>
    </div>
    <div class="choices">
      <button class="choice" onclick="answerFallout(true)">跑（今晚就走）</button>
      <button class="choice" onclick="answerFallout(false)">不跑（等他们上门）</button>
    </div>
  </div>`;
}

function answerFallout(run) {
  G.pendingFallout = null;
  const paid = (G.fallout && G.fallout.totalPaid) || 0;

  if (!run) {
    // 不跑：留置，如实交代
    G.selfSurrendered = true;
    G.waitingVerdict = true;
    $('log').innerHTML = `<div class="evresult warn">
      你没有跑。<br>那晚你在店里坐到很晚，把账本、税单、供应商合同一样一样理出来，摆在桌上。<br>
      门被敲响的时候，你去开了门。<br>
      <span style="color:#8a8a8a">—— 主动到案、如实供述，这一条会写进判决书里。</span>
    </div>`;
    $('btnNext').disabled = true;
    render();
    setTimeout(function(){ if (typeof showWaitingVerdict === 'function') showWaitingVerdict(); }, 1200);
    return;
  }

  // 跑：1% 成功 / 50% 半路被抓 / 49% 没跑出门就被盯上
  const r = Math.random();
  if (r < 0.01) {
    G.status = 'fled';
    $('log').innerHTML = `<div class="evresult bad">你跑了。真的跑掉了。</div>`;
  } else if (r < 0.51) {
    G.fledAttempt = true;
    G.waitingVerdict = true;
    $('log').innerHTML = `<div class="evresult bad">
      你在机场被拦下了。<br>
      护照递过去的那一刻，柜台后面的人多看了你两眼，然后按了一下桌子底下的按钮。<br>
      <span style="color:#8a8a8a">—— 企图潜逃，这一条会写进判决书里。</span>
    </div>`;
  } else {
    G.fledAttempt = true;
    G.waitingVerdict = true;
    $('log').innerHTML = `<div class="evresult bad">
      你还没走出这条街。<br>
      车刚拐上主路，后面就跟上来两辆车。你从后视镜里看见那个车牌，就知道今晚走不了了。<br>
      <span style="color:#8a8a8a">—— 企图潜逃，这一条会写进判决书里。</span>
    </div>`;
  }
  $('btnNext').disabled = true;
  render();
  if (G.status !== 'fled' && typeof showWaitingVerdict === 'function') {
    setTimeout(function(){ showWaitingVerdict(); }, 1400);
  } else if (G.status === 'fled') {
    setTimeout(function(){ if (typeof showFledEnding === 'function') showFledEnding(paid); }, 1200);
  }
}

/* ═══ v3.3.0（2026-10-31 老爹亲定）团购定价面板 ═══
 * 玩家可自己填团购价，跌破单位成本 → 客流暴涨（但被接待力封顶）
 */
function renderPricePanel() {
  const el = $('pricePanel');
  if (!el || typeof grouponEffect !== 'function') return;
  const e = grouponEffect(G);
  if (!e) return;

  const ratioPct = (e.ratio * 100).toFixed(0);
  const multShown = e.revMult.toFixed(2);
  const isLoss = e.ratio < 1.0;
  const isCapped = e.rawMult > e.revMult + 0.001;

  let color = '#6a8aaa';
  if (e.ratio >= 1.3) color = '#70c070';
  else if (e.ratio >= 1.0) color = '#d0c060';
  else color = '#e07070';

  let h = '<div class="panel" style="background:#0e1620;border:1px solid #2a4055;border-radius:10px;padding:12px;margin:10px 0">';
  h += '<div style="font-size:12px;color:#90c0e0;font-weight:700;margin-bottom:8px">🎟️ 团购定价</div>';
  h += '<div style="font-size:10px;color:#7a94ac;line-height:1.9;margin-bottom:8px">';
  h += '单位成本 <b style="color:#a0c0d8">¥' + e.unitCost.toFixed(1) + '</b> ｜ ';
  h += '当前定价 <b style="color:' + color + '">¥' + e.price.toFixed(0) + '</b> ';
  h += '（成本的 ' + ratioPct + '%）<br>';
  h += '客流倍数 <b style="color:' + color + '">×' + multShown + '</b>';
  if (isLoss) h += ' <span style="color:#e07070">⚠️ 跌破成本，卖一单亏一单</span>';
  if (isCapped) h += '<br><span style="color:#e0a060">⚠️ 想来的客人有 ×' + e.rawMult.toFixed(1) + '，但店接不住（上限 ×' + (e.rawMult > e.revMult ? '1.3' : '') + '），大量排队后走人</span>';
  h += '</div>';

  // 输入框 + 四个快捷档位
  h += '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">';
  h += '<input id="priceInput" type="number" min="1" step="1" value="' + e.price.toFixed(0) + '" style="width:90px;padding:7px 9px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#c8d8e8;font-size:12px;font-family:inherit">';
  h += '<button class="tbtn" onclick="applyPrice()" style="padding:7px 14px">设为团购价</button>';
  h += '<button class="tbtn" onclick="resetPrice()" style="padding:7px 10px;font-size:10px;opacity:.8">恢复标准</button>';
  h += '</div>';

  h += '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
  const modes = [['cheap', '低价冲量'], ['normal', '标准'], ['premium', '高端'], ['burn', '团购烧钱']];
  modes.forEach(function (m) {
    const active = (G.priceMode === m[0] && !(G.customPrice > 0)) ? ' style="border-color:#3a7aaa;background:#14283a"' : '';
    h += '<button class="tbtn" onclick="setPriceMode(\'' + m[0] + '\')"' + active + ' style2="" ' + (active ? '' : '') +
         ' style="padding:6px 10px;font-size:10px">' + m[1] + '</button>';
  });
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}

function applyPrice() {
  const inp = $('priceInput');
  if (!inp) return;
  const v = parseFloat(inp.value);
  if (!isFinite(v) || v <= 0) { alert('请填一个大于 0 的价格'); return; }

  // v3.6.0 加盟店：改价要过总部
  const ap = needHQApprove('price', v);
  if (!ap.passed) {
    const choice = confirm(ap.msg + '\n\n要不要硬着头皮私自改价？（可能被查到罚款）');
    if (!choice) return;
    G.customPrice = v;
    render();
    renderPricePanel();
    const pen = applyHQPenalty('price');
    if (pen) alert(pen);
    render();
    return;
  }
  if (ap.msg) alert(ap.msg);

  G.customPrice = v;
  render();
  renderPricePanel();
}

function resetPrice() {
  G.customPrice = 0;
  G.priceMode = 'normal';
  render();
  renderPricePanel();
}

function setPriceMode(m) {
  G.customPrice = 0;
  G.priceMode = m;
  render();
  renderPricePanel();
}

/* ═══ v3.4.0（2026-10-31 老爹亲定）新品研发面板 ═══ */
function renderResearchPanel() {
  const el = $('researchPanel');
  if (!el || typeof TASTE_TIERS === 'undefined') return;

  let h = '<div class="panel" style="background:#0e1620;border:1px solid #2a4055;border-radius:10px;padding:12px;margin:10px 0">';
  h += '<div style="font-size:12px;color:#90c0e0;font-weight:700;margin-bottom:8px">🍳 新品研发</div>';

  // 已研发的菜品（v3.4.1：不告诉好坏，玩家自己上架判断）
  const dishes = G.dishes || [];
  if (dishes.length) {
    h += '<div style="font-size:10px;color:#7a94ac;margin-bottom:6px">研发成果（自己看着办，上不上架你定）：</div>';
    dishes.forEach(function (d, i) {
      const on = d.onMenu;
      const sold = d.soldMonths || 0;
      h += '<div style="font-size:10px;line-height:1.9;color:' + (on ? '#7fe0a8' : '#7a94ac') + '">';
      h += (on ? '🍽️ ' : '📦 ') + d.name + '（' + d.lvl + ' 级）';
      if (sold > 0) h += ' · 已卖 ' + sold + ' 个月';
      h += ' <button class="tbtn" onclick="toggleDish(' + i + ')" style="padding:3px 9px;font-size:9px">' + (on ? '下架' : '上架') + '</button>';
      h += '</div>';
    });
    const total = (typeof dishRevBonus === 'function') ? dishRevBonus() : 0;
    h += '<div style="font-size:10px;color:' + (total >= 0 ? '#a0c0d8' : '#e07070') + ';margin:4px 0 8px">上架菜品合计影响 ' + (total >= 0 ? '+' : '') + (total * 100).toFixed(0) + '%</div>';
  }

  // 研发中
  const doing = G.research || [];
  if (doing.length) {
    h += '<div style="font-size:10px;color:#e0c080;margin-bottom:6px">研发中：</div>';
    doing.forEach(function (r) {
      h += '<div style="font-size:10px;color:#c0a070;line-height:1.8">· ' + r.name +
           '（成功率 ' + (r.chance * 100).toFixed(0) + '%，还剩 ' + r.left + ' 个月）</div>';
    });
  }

  // 发起研发（双维度：食材 × 品质）
  h += '<div style="font-size:10px;color:#7a94ac;margin:8px 0 4px">食材档位</div>';
  h += '<select id="resIng" style="width:100%;padding:7px 8px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#a0c0d8;font-size:11px;font-family:inherit">';
  INGREDIENT_TIERS.forEach(function (t) {
    h += '<option value="' + t.id + '">' + t.name + '（' + t.desc + '）</option>';
  });
  h += '</select>';
  h += '<div style="font-size:10px;color:#7a94ac;margin:8px 0 4px">品质等级（与食材无关——番茄炒蛋也能做到传世）</div>';
  h += '<select id="resQ" style="width:100%;padding:7px 8px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#a0c0d8;font-size:11px;font-family:inherit">';
  QUALITY_TIERS.forEach(function (t) {
    h += '<option value="' + t.lvl + '">' + t.lvl + '级 ' + t.name + '（成率' + (t.baseChance * 100).toFixed(1) + '%，加成+' + (t.revBonus * 100).toFixed(0) + '%）</option>';
  });
  h += '</select>';
  h += '<div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap">';
  h += '<input id="resBudget" type="number" min="1" placeholder="预算(万，可空)" style="width:110px;padding:7px 9px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#c8d8e8;font-size:11px;font-family:inherit">';
  h += '<button class="tbtn" onclick="doStartResearch()" style="padding:7px 14px">开始研发</button>';
  h += '</div>';
  h += '<div style="font-size:9px;color:#5a7a90;margin-top:6px;line-height:1.7">高端食材容错率高（好料不易做砸）｜小店灵感多、大店标准化｜同时最多 2 道｜研发期团队分心，当月营收略降</div>';

  h += '</div>';
  el.innerHTML = h;
}

function doStartResearch() {
  if (typeof startResearch !== 'function') return;
  const ingEl = $('resIng'), qEl = $('resQ'), budEl = $('resBudget');
  if (!ingEl || !qEl) return;
  const ingId = ingEl.value;
  const qLvl = parseInt(qEl.value, 10) || 1;
  const budgetWan = parseFloat(budEl && budEl.value);
  const budget = (isFinite(budgetWan) && budgetWan > 0) ? budgetWan * 1e4 : 0;
  // v3.6.0 加盟店：上新要总部批
  const ap = needHQApprove('dish');
  if (!ap.passed) {
    const choice = confirm(ap.msg + '\n\n要不要自己偷偷上？（被查到可能被责令下架）');
    if (!choice) return;
    const r2 = startResearch(ingId, qLvl, budget);
    alert(r2.msg);
    const pen = applyHQPenalty('dish');
    if (pen) alert(pen);
    render();
    return;
  }
  if (ap.msg) alert(ap.msg);

  const r = startResearch(ingId, qLvl, budget);
  alert(r.msg);
  render();
  renderResearchPanel();
}

function toggleDish(i) {
  if (typeof toggleDishOnMenu !== 'function') return;
  const r = toggleDishOnMenu(i);
  if (r && r.msg) alert(r.msg);
  render();
}

/* ═══ v3.5.0 厨师面板 ═══ */
function renderChefPanel() {
  const el = $('chefPanel');
  if (!el || typeof CHEF_LEVELS === 'undefined') return;
  if (typeof ensureChef !== 'function') return;
  const c = ensureChef();

  let h = '<div class="panel" style="background:#0e1620;border:1px solid #2a4055;border-radius:10px;padding:12px;margin:10px 0">';
  h += '<div style="font-size:12px;color:#90c0e0;font-weight:700;margin-bottom:8px">👨‍🍳 主厨</div>';
  h += '<div style="font-size:11px;color:#a0c0d8;line-height:1.9">';
  h += '等级 <b style="color:#7fe0a8">' + c.lvl + ' 级 · ' + c.name + '</b>';
  h += ' ｜ 月薪 <b>' + (c.wage / 1e4).toFixed(1) + ' 万</b>';
  h += ' ｜ 手艺系数 <b style="color:#e0c080">×' + c.skill.toFixed(2) + '</b>';
  h += '<br><span style="font-size:10px;color:#6a8aaa">' + (CHEF_LEVELS.find(x => x.lvl === c.lvl) || {}).desc + '</span>';
  h += '</div>';

  // 忠诚度只给模糊描述，不给数字
  let loyTxt = '不太好', loyColor = '#e07070';
  if (c.loyalty >= 75) { loyTxt = '很踏实'; loyColor = '#70c070'; }
  else if (c.loyalty >= 55) { loyTxt = '还算稳'; loyColor = '#a0c080'; }
  else if (c.loyalty >= 40) { loyTxt = '有点飘'; loyColor = '#e0c060'; }
  h += '<div style="font-size:10px;color:#7a94ac;margin-top:6px">状态：<b style="color:' + loyColor + '">' + loyTxt + '</b>';
  h += ' ｜ 跟了你 ' + c.seasons + ' 个月</div>';

  if (c.lvl < 5) {
    const next = CHEF_LEVELS.find(x => x.lvl === c.lvl + 1);
    const cost = next.wage * 12;
    h += '<button class="tbtn" onclick="doTrainChef()" style="margin-top:8px;padding:7px 14px;font-size:11px">送培训升「' + next.name + '」（' + (cost / 1e4).toFixed(0) + ' 万）</button>';
  }
  h += '</div>';
  el.innerHTML = h;
}

function doTrainChef() {
  if (typeof trainChef !== 'function') return;
  const r = trainChef();
  alert(r.msg);
  render();
}

/* ═══ v3.5.1 推广面板 ═══ */
function renderPromoPanel() {
  const el = $('promoPanel');
  if (!el || typeof PROMO_TIERS === 'undefined') return;
  const power = (typeof currentPromoPower === 'function') ? currentPromoPower() : 1.0;
  const active = (G.promos || []).filter(p => p.left > 0);

  let h = '<div class="panel" style="background:#0e1620;border:1px solid #2a4055;border-radius:10px;padding:12px;margin:10px 0">';
  h += '<div style="font-size:12px;color:#90c0e0;font-weight:700;margin-bottom:8px">📣 推广</div>';
  h += '<div style="font-size:11px;color:#a0c0d8;line-height:1.9">当前推广力 <b style="color:' +
       (power >= 2 ? '#7fe0a8' : power >= 1.3 ? '#e0c080' : '#8aa8c0') + '">×' + power.toFixed(2) + '</b>';
  h += '<span style="font-size:10px;color:#6a8aaa">（决定网红爆款的开发成功率）</span></div>';

  if (active.length) {
    h += '<div style="font-size:10px;color:#c0a070;margin-top:6px">进行中：';
    active.forEach(p => { h += '· ' + p.name + '（还剩 ' + p.left + ' 月）'; });
    h += '</div>';
  }

  h += '<div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap">';
  h += '<select id="promoTier" style="flex:1;min-width:150px;padding:7px 8px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#a0c0d8;font-size:11px;font-family:inherit">';
  PROMO_TIERS.forEach(t => {
    h += '<option value="' + t.id + '">' + t.name + '（' + (t.minCost / 1e4).toFixed(1) + '~' + (t.maxCost / 1e4).toFixed(0) + ' 万）</option>';
  });
  h += '</select>';
  h += '<input id="promoBudget" type="number" min="0.1" step="0.1" placeholder="预算(万)" style="width:100px;padding:7px 9px;background:#0a1218;border:1px solid #2a4055;border-radius:7px;color:#c8d8e8;font-size:11px;font-family:inherit">';
  h += '<button class="tbtn" onclick="doStartPromo()" style="padding:7px 14px">投放</button>';
  h += '</div>';
  h += '<div style="font-size:9px;color:#5a7a90;margin-top:6px;line-height:1.7">一次性投放，不月月扣｜效果随时间衰减｜有翻车风险（钱花了没水花）</div>';
  h += '</div>';
  el.innerHTML = h;
}

function doStartPromo() {
  if (typeof startPromo !== 'function') return;
  const tEl = $('promoTier'), bEl = $('promoBudget');
  if (!tEl) return;
  const budgetWan = parseFloat(bEl && bEl.value);
  const budget = (isFinite(budgetWan) && budgetWan > 0) ? budgetWan * 1e4 : 0;
  // v3.6.0 加盟店：推广要报批
  const ap = needHQApprove('promo');
  if (!ap.passed) {
    const choice = confirm(ap.msg + '\n\n要不要私下投放？（可能被总部查到）');
    if (!choice) return;
    const r2 = startPromo(tEl.value, budget);
    alert(r2.msg);
    const pen = applyHQPenalty('promo');
    if (pen) alert(pen);
    render();
    return;
  }
  if (ap.msg) alert(ap.msg);

  const r = startPromo(tEl.value, budget);
  alert(r.msg);
  render();
}

/* ═══ v3.6.0 报批封装：加盟状态下要过总部 ═══ */
function needHQApprove(actionType, detail) {
  if (typeof hqApprove !== 'function' || typeof isFranchised !== 'function') return { passed: true, msg: '' };
  if (!isFranchised()) return { passed: true, msg: '' };
  const r = hqApprove(actionType, detail);
  return r;
}

/* 违规处罚执行（私下做了没报批的事） */
function applyHQPenalty(actionType) {
  if (typeof hqPenalty !== 'function' || typeof isFranchised !== 'function') return null;
  if (!isFranchised()) return null;
  const p = hqPenalty(actionType, G.revenueLast || 0);
  if (p && p.caught) return p.text;
  return null;
}
