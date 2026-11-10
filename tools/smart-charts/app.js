/* 肥鱼 · 智能图表 app.js
 * 2026-10-19 v1 首版
 * 全前端：数据不出浏览器，不联网
 */
(function () {
  'use strict';

  /* ========== 状态 ========== */
  var state = {
    rows: [],       // 二维数组（含表头）
    headers: [],    // 列名
    cols: [],       // {name, index, type:'num'|'cat'|'date'}
    chart: null
  };

  /* ========== 图表类型（32 种，v1 已实现常用 12 种） ========== */
  var CHART_TYPES = [
    { k: 'line',            n: '📈 折线图',        ready: true },
    { k: 'bar',             n: '📊 柱状图',        ready: true },
    { k: 'stacked_bar',     n: '📚 堆叠柱状图',    ready: true },
    { k: 'pie',             n: '🥧 饼图',          ready: true },
    { k: 'doughnut',        n: '🍩 环形图',        ready: true },
    { k: 'rose',            n: '🌹 玫瑰图',        ready: true },
    { k: 'area',            n: '🏔 面积图',        ready: true },
    { k: 'scatter',         n: '✨ 散点图',        ready: true },
    { k: 'bubble',          n: '🫧 气泡图',        ready: true },
    { k: 'histogram',       n: '📶 直方图',        ready: true },
    { k: 'radar',           n: '🕸 雷达图',        ready: true },
    { k: 'funnel',          n: '🧲 漏斗图',        ready: true },
    { k: 'gauge',           n: '🎯 仪表盘',        ready: true },
    { k: 'treemap',         n: '🟦 矩形树图',      ready: true },
    { k: 'heatmap',         n: '🔥 热力图',        ready: false },
    { k: 'boxplot',         n: '📦 箱线图',        ready: false },
    { k: 'waterfall',       n: '💧 瀑布图',        ready: false },
    { k: 'sankey',          n: '🌊 桑基图',        ready: false },
    { k: 'sunburst',        n: '☀️ 旭日图',        ready: false },
    { k: 'wordcloud',       n: '☁️ 词云',          ready: true  },
    { k: 'pareto',          n: '📐 帕累托图',      ready: false },
    { k: 'combo',           n: '🔀 组合图',        ready: false },
    { k: 'venn',            n: '⭕ 韦恩图',        ready: false },
    { k: 'mindmap',         n: '🧠 思维导图',      ready: false },
    { k: 'orgchart',        n: '🏢 组织架构图',    ready: false },
    { k: 'liquid',          n: '💦 水波纹',        ready: true  },
    { k: 'calendar',        n: '📅 日历热力图',    ready: false },
    { k: 'pictorial_bar',   n: '🖼 象形柱图',      ready: false },
    { k: 'graph',           n: '🕸 关系图',        ready: false },
    { k: 'effect_scatter',  n: '💫 动态散点',      ready: false },
    { k: 'theme_river',     n: '🏞 主题河流图',    ready: false },
    { k: 'spreadsheet',     n: '📋 表格视图',      ready: false }
  ];

  /* ========== 主题配色 ========== */
  var THEMES = {
    default: { bg: '#0b1620', axis: '#3d5f78', text: '#9db8cc',
      palette: ['#4fc3f7','#7ee8a2','#ffd86a','#ff8a8a','#b48cff','#5ce1e6','#f7a072','#9fe0ff'] },
    classic: { bg: '#ffffff', axis: '#bbb', text: '#444',
      palette: ['#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4'] },
    dark: { bg: '#1a1a20', axis: '#555', text: '#ccc',
      palette: ['#ffd86a','#7ee8a2','#4fc3f7','#ff8a8a','#b48cff','#5ce1e6','#f7a072','#c8f5e0'] }
  };

  /* ========== DOM ========== */
  var $ = function (id) { return document.getElementById(id); };
  var dropEl, fileEl, panelEl, ctypeEl, themeEl, xcolEl, ycolEl, titleEl, msgEl, chartEl, infoEl;

  /* ========== 初始化 ========== */
  function boot() {
    dropEl = $('drop'); fileEl = $('file'); panelEl = $('panel');
    ctypeEl = $('ctype'); themeEl = $('theme'); xcolEl = $('xcol'); ycolEl = $('ycol');
    titleEl = $('title'); msgEl = $('msg'); chartEl = $('chart'); infoEl = $('info');

    // 填充图表类型
    CHART_TYPES.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t.k;
      o.textContent = t.n + (t.ready ? '' : '（开发中）');
      o.disabled = !t.ready;
      ctypeEl.appendChild(o);
    });

    // 拖拽
    dropEl.addEventListener('click', function () { fileEl.click(); });
    dropEl.addEventListener('dragover', function (e) { e.preventDefault(); dropEl.classList.add('drag'); });
    dropEl.addEventListener('dragleave', function () { dropEl.classList.remove('drag'); });
    dropEl.addEventListener('drop', function (e) {
      e.preventDefault(); dropEl.classList.remove('drag');
      if (e.dataTransfer.files.length) readFile(e.dataTransfer.files[0]);
    });
    fileEl.addEventListener('change', function () {
      if (fileEl.files.length) readFile(fileEl.files[0]);
    });

    $('draw').addEventListener('click', draw);
    $('save').addEventListener('click', savePng);
    $('again').addEventListener('click', reset);
    themeEl.addEventListener('change', function () { if (state.rows.length) draw(); });
    ctypeEl.addEventListener('change', adaptForType);
  }

  /* ========== 读文件 ========== */
  function readFile(file) {
    msg('正在读取 ' + file.name + ' …');
    var name = file.name.toLowerCase();
    var reader = new FileReader();

    reader.onerror = function () { msg('读取失败', true); };

    if (/\.(xlsx|xls)$/.test(name)) {
      reader.onload = function (e) {
        try {
          var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          var sh = wb.Sheets[wb.SheetNames[0]];
          var arr = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '', raw: true });
          loadRows(arr);
        } catch (err) { msg('Excel 解析失败：' + err.message, true); }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    reader.onload = function (e) {
      var text = e.target.result;
      try {
        var rows;
        if (/\.json$/.test(name)) {
          rows = parseJson(text);
        } else {
          rows = parseCsv(text, /\.tsv$/.test(name) ? '\t' : null);
        }
        loadRows(rows);
      } catch (err) { msg('解析失败：' + err.message, true); }
    };
    reader.readAsText(file, 'UTF-8');
  }

  /* 简易 CSV 解析（支持引号、逗号、换行） */
  function parseCsv(text, forceSep) {
    text = text.replace(/^\uFEFF/, '');        // 去 BOM
    var firstLine = text.split(/\r?\n/)[0] || '';
    var sep = forceSep;
    if (!sep) {
      var cands = [',', ';', '\t', '|'];
      var best = ',', bestN = 0;
      cands.forEach(function (c) {
        var n = firstLine.split(c).length;
        if (n > bestN) { bestN = n; best = c; }
      });
      sep = best;
    }
    var rows = [], cur = [], field = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else q = false;
        } else field += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === sep) { cur.push(field); field = ''; }
        else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
        else if (ch === '\r') { /* skip */ }
        else field += ch;
      }
    }
    if (field !== '' || cur.length) { cur.push(field); rows.push(cur); }
    return rows.filter(function (r) { return r.some(function (x) { return String(x).trim() !== ''; }); });
  }

  /* JSON：数组对象 或 二维数组 */
  function parseJson(text) {
    var d = JSON.parse(text);
    if (!Array.isArray(d)) throw new Error('JSON 顶层必须是数组');
    if (!d.length) return [];
    if (Array.isArray(d[0])) return d;
    var keys = Object.keys(d[0]);
    var out = [keys];
    d.forEach(function (o) {
      out.push(keys.map(function (k) { return o[k]; }));
    });
    return out;
  }

  /* ========== 装载数据 ========== */
  function loadRows(rows) {
    if (!rows || rows.length < 2) { msg('文件里没有足够的数据（至少要有表头 + 一行数据）', true); return; }

    // 表头：取第一行，去空
    var head = rows[0].map(function (h, i) {
      var s = String(h == null ? '' : h).trim();
      return s || ('列' + (i + 1));
    });
    // 去掉尾部全空列
    var body = rows.slice(1).filter(function (r) {
      return r.some(function (x) { return String(x).trim() !== ''; });
    });
    if (!body.length) { msg('没有数据行', true); return; }

    state.headers = head;
    state.rows = body;
    state.cols = head.map(function (name, i) {
      return { name: name, index: i, type: guessType(body, i) };
    });

    buildSelectors();
    panelEl.classList.remove('hidden');
    dropEl.classList.add('hidden');
    chartEl.classList.remove('hidden');
    infoEl.classList.remove('hidden');

    info('<b>' + state.rows.length + '</b> 行 · <b>' + head.length + '</b> 列 · ' +
      '文件：' + (state.cols.length ? '' : '') + fileInfo);

    msg('读取成功，选个图类型试试');
    adaptForType();
    draw();
  }

  var fileInfo = '';

  /* 推断列类型 */
  function guessType(rows, idx) {
    var num = 0, total = 0, date = 0;
    for (var i = 0; i < Math.min(rows.length, 200); i++) {
      var v = rows[i][idx];
      if (v == null || String(v).trim() === '') continue;
      total++;
      var s = String(v).trim();
      var n = Number(s.replace(/,/g, '').replace(/%$/, ''));
      if (!isNaN(n) && s !== '') num++;
      if (/^\d{4}[-\/]\d{1,2}([-\/]\d{1,2})?/.test(s)) date++;
    }
    if (!total) return 'cat';
    if (date / total > 0.7) return 'date';
    if (num / total > 0.7) return 'num';
    return 'cat';
  }

  /* ========== 下拉框 ========== */
  function buildSelectors() {
    xcolEl.innerHTML = '';
    ycolEl.innerHTML = '';
    var cats = state.cols.filter(function (c) { return c.type !== 'num'; });
    var nums = state.cols.filter(function (c) { return c.type === 'num'; });

    (cats.length ? cats : state.cols).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.index; o.textContent = c.name;
      xcolEl.appendChild(o);
    });
    (nums.length ? nums : state.cols).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.index; o.textContent = c.name;
      ycolEl.appendChild(o);
    });
    // 默认选第一个数值列
    if (ycolEl.options.length) ycolEl.options[0].selected = true;
  }

  /* 按类型调整选择器可见性 */
  function adaptForType() {
    var k = ctypeEl.value;
    var needX = ['line','bar','stacked_bar','area','pie','doughnut','rose','funnel','treemap','wordcloud'];
    var needY = ['line','bar','stacked_bar','area','scatter','bubble','histogram','radar','gauge','treemap','wordcloud'];
    xcolEl.parentElement.style.opacity = needX.indexOf(k) >= 0 ? 1 : 0.35;
    ycolEl.parentElement.style.opacity = needY.indexOf(k) >= 0 ? 1 : 0.35;
  }

  /* ========== 取数据 ========== */
  function colValues(idx) {
    return state.rows.map(function (r) { return r[idx]; });
  }

  function toNumber(v) {
    if (v == null) return null;
    var s = String(v).trim().replace(/,/g, '').replace(/%$/, '');
    if (s === '') return null;
    var n = Number(s);
    return isNaN(n) ? null : n;
  }

  /* 聚合：同名分类求和 */
  function aggregate(xIdx, yIdx) {
    var map = new Map(), order = [];
    state.rows.forEach(function (r) {
      var key = String(r[xIdx] == null ? '' : r[xIdx]).trim() || '(空)';
      var n = toNumber(r[yIdx]);
      if (n == null) return;
      if (!map.has(key)) { map.set(key, 0); order.push(key); }
      map.set(key, map.get(key) + n);
    });
    return {
      names: order,
      values: order.map(function (k) { return Math.round(map.get(k) * 100) / 100; })
    };
  }

  /* ========== 画图 ========== */
  function draw() {
    if (!state.rows.length) return;
    var k = ctypeEl.value;
    var xIdx = parseInt(xcolEl.value, 10);
    var yIdx = parseInt(ycolEl.value, 10);
    var th = THEMES[themeEl.value] || THEMES.default;
    var title = titleEl.value.trim();

    var opt = null;
    try {
      opt = buildOption(k, xIdx, yIdx, th, title);
    } catch (e) {
      msg('生成图表失败：' + e.message, true);
      return;
    }
    if (!opt) { msg('这个图表类型还在开发中', true); return; }

    if (!state.chart) {
      state.chart = echarts.init(chartEl, null, { renderer: 'canvas' });
      window.addEventListener('resize', function () { state.chart.resize(); });
    }
    state.chart.clear();
    state.chart.setOption(opt, true);
    msg('画好了 · 点「保存图片」可下载');
  }

  function buildOption(k, xIdx, yIdx, th, title) {
    var base = {
      backgroundColor: th.bg,
      color: th.palette,
      title: title ? { text: title, left: 'center', top: 8,
        textStyle: { color: th.text, fontSize: 14 } } : undefined,
      tooltip: { trigger: k === 'pie' || k === 'doughnut' || k === 'rose' || k === 'funnel' ? 'item' : 'axis' },
      textStyle: { color: th.text }
    };

    var agg = aggregate(xIdx, yIdx);

    switch (k) {
      case 'line':
      case 'area':
        return Object.assign(base, {
          grid: { left: 50, right: 24, top: title ? 46 : 26, bottom: 46 },
          xAxis: { type: 'category', data: agg.names, axisLine: { lineStyle: { color: th.axis } },
            axisLabel: { color: th.text, fontSize: 10, rotate: agg.names.length > 12 ? 40 : 0 } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: th.axis, opacity: .2 } },
            axisLabel: { color: th.text, fontSize: 10 } },
          series: [{
            type: 'line', data: agg.values, smooth: true,
            areaStyle: k === 'area' ? { opacity: .35 } : undefined,
            symbolSize: 6, lineStyle: { width: 2 }
          }]
        });

      case 'bar':
        return Object.assign(base, {
          grid: { left: 50, right: 24, top: title ? 46 : 26, bottom: 46 },
          xAxis: { type: 'category', data: agg.names, axisLine: { lineStyle: { color: th.axis } },
            axisLabel: { color: th.text, fontSize: 10, rotate: agg.names.length > 12 ? 40 : 0 } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: th.axis, opacity: .2 } },
            axisLabel: { color: th.text, fontSize: 10 } },
          series: [{ type: 'bar', data: agg.values, barMaxWidth: 40 }]
        });

      case 'stacked_bar': {
        var sel = Array.from(ycolEl.selectedOptions).map(function (o) { return parseInt(o.value, 10); });
        if (!sel.length) sel = [yIdx];
        var names = [], seen = {};
        state.rows.forEach(function (r) {
          var key = String(r[xIdx] == null ? '' : r[xIdx]).trim() || '(空)';
          if (!seen[key]) { seen[key] = 1; names.push(key); }
        });
        var series = sel.map(function (ci) {
          var m = new Map();
          state.rows.forEach(function (r) {
            var key = String(r[xIdx] == null ? '' : r[xIdx]).trim() || '(空)';
            var n = toNumber(r[ci]); if (n == null) return;
            m.set(key, (m.get(key) || 0) + n);
          });
          return { name: state.cols[ci].name, type: 'bar', stack: 'total',
            data: names.map(function (nm) { return Math.round((m.get(nm) || 0) * 100) / 100; }) };
        });
        return Object.assign(base, {
          grid: { left: 50, right: 24, top: title ? 46 : 26, bottom: 46 },
          legend: { top: title ? 30 : 6, textStyle: { color: th.text, fontSize: 10 } },
          xAxis: { type: 'category', data: names, axisLine: { lineStyle: { color: th.axis } },
            axisLabel: { color: th.text, fontSize: 10, rotate: names.length > 12 ? 40 : 0 } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: th.axis, opacity: .2 } },
            axisLabel: { color: th.text, fontSize: 10 } },
          series: series
        });
      }

      case 'pie':
      case 'doughnut':
      case 'rose': {
        var data = agg.names.map(function (nm, i) { return { name: nm, value: agg.values[i] }; });
        data.sort(function (a, b) { return b.value - a.value; });
        if (data.length > 30) data = data.slice(0, 30);
        return Object.assign(base, {
          series: [{
            type: 'pie',
            radius: k === 'doughnut' ? ['40%', '70%'] : (k === 'rose' ? ['20%', '75%'] : '62%'),
            roseType: k === 'rose' ? 'radius' : undefined,
            center: ['50%', '55%'],
            data: data,
            label: { color: th.text, fontSize: 10 },
            labelLine: { length: 8, length2: 8 }
          }]
        });
      }

      case 'scatter':
      case 'bubble': {
        var selNums = state.cols.filter(function (c) { return c.type === 'num'; });
        var xi = selNums.length > 1 ? selNums[0].index : xIdx;
        var yi = selNums.length > 1 ? selNums[1].index : yIdx;
        var pts = [];
        state.rows.forEach(function (r) {
          var a = toNumber(r[xi]), b = toNumber(r[yi]);
          if (a == null || b == null) return;
          pts.push(k === 'bubble' ? [a, b, 12] : [a, b]);
        });
        return Object.assign(base, {
          grid: { left: 56, right: 24, top: title ? 46 : 26, bottom: 46 },
          xAxis: { type: 'value', name: state.cols[xi].name, nameTextStyle: { color: th.text, fontSize: 10 },
            splitLine: { lineStyle: { color: th.axis, opacity: .2 } }, axisLabel: { color: th.text, fontSize: 10 } },
          yAxis: { type: 'value', name: state.cols[yi].name, nameTextStyle: { color: th.text, fontSize: 10 },
            splitLine: { lineStyle: { color: th.axis, opacity: .2 } }, axisLabel: { color: th.text, fontSize: 10 } },
          series: [{ type: 'scatter', data: pts, symbolSize: k === 'bubble' ? function (d) { return Math.max(8, Math.min(30, d[2])); } : 9 }]
        });
      }

      case 'histogram': {
        var vals = [];
        state.rows.forEach(function (r) { var n = toNumber(r[yIdx]); if (n != null) vals.push(n); });
        if (!vals.length) throw new Error('这列没有数值');
        var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
        var bins = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(vals.length))));
        var step = (max - min) / bins || 1;
        var counts = new Array(bins).fill(0);
        var labels = [];
        for (var i = 0; i < bins; i++) {
          var lo = min + step * i, hi = lo + step;
          labels.push(Math.round(lo * 100) / 100 + '~' + Math.round(hi * 100) / 100);
        }
        vals.forEach(function (v) {
          var idx = Math.min(bins - 1, Math.floor((v - min) / step));
          counts[idx]++;
        });
        return Object.assign(base, {
          grid: { left: 50, right: 24, top: title ? 46 : 26, bottom: 60 },
          xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: th.axis } },
            axisLabel: { color: th.text, fontSize: 9, rotate: 40 } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: th.axis, opacity: .2 } },
            axisLabel: { color: th.text, fontSize: 10 } },
          series: [{ type: 'bar', data: counts, barCategoryGap: '4%' }]
        });
      }

      case 'radar': {
        var nums = state.cols.filter(function (c) { return c.type === 'num'; }).slice(0, 8);
        if (!nums.length) throw new Error('没有数值列');
        var indicator = nums.map(function (c) {
          var vs = colValues(c.index).map(toNumber).filter(function (x) { return x != null; });
          return { name: c.name, max: Math.max.apply(null, vs.concat([1])) * 1.1 };
        });
        var series = [];
        var xv = colValues(xIdx);
        var uniq = [], seenX = {};
        xv.forEach(function (v) {
          var s = String(v == null ? '' : v).trim();
          if (!s || seenX[s]) return;
          seenX[s] = 1; if (uniq.length < 6) uniq.push(s);
        });
        uniq.forEach(function (nm) {
          var row = state.rows.find(function (r) { return String(r[xIdx]).trim() === nm; });
          if (!row) return;
          series.push({ name: nm, value: nums.map(function (c) { return toNumber(row[c.index]) || 0; }) });
        });
        return Object.assign(base, {
          radar: { indicator: indicator, center: ['50%', '56%'], radius: '62%',
            axisName: { color: th.text, fontSize: 10 },
            splitLine: { lineStyle: { color: th.axis, opacity: .3 } },
            splitArea: { areaStyle: { color: ['transparent'] } } },
          legend: { bottom: 4, textStyle: { color: th.text, fontSize: 10 } },
          tooltip: { trigger: 'item' },
          series: [{ type: 'radar', data: series.slice(0, 5),
            areaStyle: { opacity: .18 }, symbolSize: 4 }]
        });
      }

      case 'funnel': {
        var fd = agg.names.map(function (nm, i) { return { name: nm, value: agg.values[i] }; });
        fd.sort(function (a, b) { return b.value - a.value; });
        if (fd.length > 15) fd = fd.slice(0, 15);
        return Object.assign(base, {
          series: [{ type: 'funnel', left: '12%', right: '12%', top: title ? 50 : 30, bottom: 24,
            data: fd, label: { color: th.text, fontSize: 10 } }]
        });
      }

      case 'gauge': {
        var vs2 = colValues(yIdx).map(toNumber).filter(function (x) { return x != null; });
        if (!vs2.length) throw new Error('这列没有数值');
        var sum = vs2.reduce(function (a, b) { return a + b; }, 0);
        var avg = sum / vs2.length;
        var maxG = Math.max.apply(null, vs2) * 1.1 || 100;
        return Object.assign(base, {
          series: [{
            type: 'gauge', min: 0, max: Math.round(maxG * 100) / 100,
            center: ['50%', '58%'], radius: '72%',
            detail: { valueAnimation: true, color: th.text, fontSize: 18,
              formatter: function (v) { return Math.round(v * 100) / 100; } },
            axisLine: { lineStyle: { width: 14 } },
            axisLabel: { color: th.text, fontSize: 9 },
            data: [{ value: Math.round(avg * 100) / 100, name: state.cols[yIdx].name + ' 平均值' }],
            title: { color: th.text, fontSize: 11 }
          }]
        });
      }

      case 'treemap': {
        var td = agg.names.map(function (nm, i) { return { name: nm, value: Math.abs(agg.values[i]) }; })
          .filter(function (d) { return d.value > 0; });
        if (!td.length) throw new Error('没有正数数据');
        return Object.assign(base, {
          series: [{ type: 'treemap', data: td, top: title ? 50 : 20, bottom: 20, left: 20, right: 20,
            label: { color: '#fff', fontSize: 11 },
            levels: [{ itemStyle: { borderColor: th.bg, borderWidth: 2, gapWidth: 2 } }] }]
        });
      }

      case 'wordcloud': {
        var wc = aggregate(xIdx, yIdx);
        var wd = wc.names.map(function (nm, i) { return { name: nm, value: Math.abs(wc.values[i]) }; })
          .filter(function (d) { return d.value > 0; });
        if (!wd.length) throw new Error('没有正数数据');
        return Object.assign(base, {
          tooltip: { trigger: 'item' },
          series: [{ type: 'wordCloud', shape: 'circle',
            left: 'center', top: title ? 50 : 24, width: '90%', height: '76%',
            sizeRange: [12, 46], rotationRange: [-45, 45], gridSize: 8,
            textStyle: { color: function () {
              return th.palette[Math.floor(Math.random() * th.palette.length)];
            } },
            data: wd.slice(0, 100) }]
        });
      }

      case 'liquid': {
        var vs3 = colValues(yIdx).map(toNumber).filter(function (x) { return x != null; });
        if (!vs3.length) throw new Error('这列没有数值');
        var mx = Math.max.apply(null, vs3);
        var first = vs3.length ? vs3[0] : 0;
        var ratio = mx > 0 ? Math.min(1, Math.abs(first) / mx) : 0;
        return Object.assign(base, {
          series: [{
            type: 'liquidFill', data: [Math.round(ratio * 1000) / 1000],
            center: ['50%', '58%'], radius: '62%',
            label: { fontSize: 22, color: th.text, formatter: function () { return Math.round(ratio * 100) + '%'; } },
            backgroundStyle: { color: 'rgba(255,255,255,.06)' }
          }]
        });
      }
    }
    return null;
  }

  /* ========== 保存图片 ========== */
  function savePng() {
    if (!state.chart) return;
    var url = state.chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: (THEMES[themeEl.value] || THEMES.default).bg });
    var a = document.createElement('a');
    a.href = url;
    a.download = (titleEl.value.trim() || 'chart') + '.png';
    a.click();
  }

  /* ========== 重置 ========== */
  function reset() {
    state.rows = []; state.headers = []; state.cols = [];
    if (state.chart) { state.chart.dispose(); state.chart = null; }
    dropEl.classList.remove('hidden');
    panelEl.classList.add('hidden');
    chartEl.classList.add('hidden');
    infoEl.classList.add('hidden');
    fileEl.value = '';
    msg('');
  }

  /* ========== 工具 ========== */
  function msg(t, isErr) {
    msgEl.textContent = t || '';
    msgEl.className = isErr ? 'err' : '';
  }
  function info(html) { infoEl.innerHTML = html; }

  document.addEventListener('DOMContentLoaded', boot);
})();
