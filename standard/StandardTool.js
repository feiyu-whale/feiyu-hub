/**
 * StandardTool.js —— 专业工具标准基类（黑金主题）
 * 版本: v1-基类首版 20261016
 * 作者: 肥鱼 🐳
 *
 * 目的：新增工具**不必重写 UI**。只需给一份 JSON 配置 + 一个计算函数。
 *
 * 用法（工具目录下 index.html 里）：
 *   <div id="app"></div>
 *   <script src="../standard/StandardTool.js"></script>
 *   <script>
 *     StandardTool.mount("#app", {
 *       title: "电缆载流量计算器",
 *       desc: "查表 + 环境温度/穿管根数/敷设方式 校正系数",
 *       inputs: [
 *         { key:"area", label:"截面积", unit:"mm²", type:"number", default:2.5 },
 *         { key:"temp", label:"环境温度", unit:"℃", type:"select",
 *           options:[{v:30,label:"30℃"},{v:40,label:"40℃"}] },
 *         { key:"k1",   label:"温度校正", type:"number", default:1 },
 *       ],
 *       compute: function(v){ return { value: v.area * v.k1, unit: "A" }; },
 *       anchors: ["1 mm² 铜芯 ≈ 10~16 A（穿管降额后更低）"]
 *     });
 *   </script>
 *
 * 约定：工具页面必须 IIFE 隔离；本基类自身也 IIFE 隔离，不污染全局（仅暴露一个 StandardTool）。
 */
(function(){
  'use strict';

  // ===== 黑金主题样式（注入一次）=====
  var CSS = `
  .st-wrap { max-width:560px; margin:0 auto; padding:18px 14px 40px; color:#dbeafe;
    font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif; user-select:none; }
  .st-wrap * { box-sizing:border-box; }
  .st-back { display:inline-block; text-decoration:none; color:#6b8fb3; font-size:13px; margin-bottom:12px;
    padding:6px 12px; border:1px solid #22384c; border-radius:20px; }
  .st-h1 { font-size:20px; color:#9fe0ff; text-align:center; margin-bottom:6px; font-weight:700; }
  .st-sub { text-align:center; color:#5b7a99; font-size:12px; margin-bottom:16px; line-height:1.6; }
  .st-card { background:#0e1a26; border:1px solid #24384c; border-radius:12px; padding:14px; margin-bottom:12px; }
  .st-lbl { font-size:11px; color:#6b8fb3; margin-bottom:9px; letter-spacing:1px; }
  .st-f { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .st-f > label { width:92px; font-size:13px; color:#9fe0ff; flex:0 0 auto; }
  .st-f input, .st-f select { flex:1 1 auto; min-width:0; background:#060a10; border:1px solid #24384c;
    border-radius:9px; padding:10px 11px; color:#eaf4ff; font-size:14px; font-family:inherit; }
  .st-f input:focus, .st-f select:focus { outline:none; border-color:#4d8fc9; }
  .st-f .st-u { font-size:12px; color:#6b8fb3; width:40px; flex:0 0 auto; }
  .st-btn { display:inline-block; background:linear-gradient(160deg,#2e6ea8,#1b4670); color:#fff;
    border:1px solid #4d8fc9; border-radius:9px; padding:10px 16px; font-size:14px; font-weight:600;
    cursor:pointer; font-family:inherit; margin-top:2px; }
  .st-btn:active { transform:scale(.97); }
  .st-out { font-size:18px; color:#8fe0c0; font-weight:700; text-align:center; padding:13px;
    background:#060a10; border-radius:9px; font-family:ui-monospace,Menlo,Consolas,monospace; word-break:break-all; }
  .st-out .st-big { font-size:26px; }
  .st-out small { display:block; color:#5b7a99; font-size:12px; font-weight:400; margin-top:6px; }
  .st-err { color:#ff8fa3; font-size:14px; text-align:center; padding:12px; background:#1a1014; border-radius:9px; }
  .st-rows { }
  .st-rows .st-r { display:flex; justify-content:space-between; padding:9px 12px; background:#060a10;
    border-radius:9px; margin-bottom:7px; font-size:14px; gap:10px; }
  .st-rows .st-r .k { color:#8fb3cf; }
  .st-rows .st-r .v { color:#8fe0c0; font-weight:700; font-family:ui-monospace,monospace; text-align:right; word-break:break-all; }
  .st-anchor { margin-top:12px; }
  .st-anchor .st-a { font-size:12.5px; color:#7fa0bd; padding:7px 11px; background:#0a1420;
    border-left:3px solid #2e5f8e; border-radius:6px; margin-bottom:6px; line-height:1.5; word-break:break-word; }
  .st-ver { text-align:center; color:#22383c; font-size:10px; margin-top:22px; }
  `;

  function injectCSS(){
    if(document.getElementById("st-style")) return;
    var s = document.createElement("style");
    s.id = "st-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function h(tag, attrs, children){
    var el = document.createElement(tag);
    if(attrs) for(var k in attrs){
      if(k === "class") el.className = attrs[k];
      else if(k === "text") el.textContent = attrs[k];
      else if(k === "html") el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if(children) children.forEach(function(c){ if(c!=null) el.appendChild(c); });
    return el;
  }

  function fmt(n){
    if(typeof n !== "number" || !isFinite(n)) return String(n);
    if(Math.abs(n) >= 1e9 || (Math.abs(n) > 0 && Math.abs(n) < 1e-4))
      return n.toExponential(4);
    return String(Math.round(n*1e6)/1e6);
  }

  var StandardTool = {
    version: "v1-基类首版 20261016",

    /**
     * 挂载一个标准工具
     * @param {string|HTMLElement} target 选择器或元素
     * @param {object} cfg 配置
     */
    mount: function(target, cfg){
      injectCSS();
      var root = (typeof target === "string") ? document.querySelector(target) : target;
      if(!root){ console.error("[StandardTool] 找不到挂载点:", target); return; }

      root.className = "st-wrap";
      root.innerHTML = "";

      // 返回键
      root.appendChild(h("a", { class:"st-back", href: cfg.back || "../", text: cfg.backText || "← 返回" }));
      // 标题
      root.appendChild(h("h1", { class:"st-h1", text: cfg.title || "工具" }));
      if(cfg.desc) root.appendChild(h("div", { class:"st-sub", text: cfg.desc }));

      // 输入卡片
      var inputs = cfg.inputs || [];
      var fieldEls = {};
      if(inputs.length){
        var inCard = h("div", { class:"st-card" });
        inCard.appendChild(h("div", { class:"st-lbl", text: cfg.inputLabel || "输入" }));
        inputs.forEach(function(inp){
          var row = h("div", { class:"st-f" });
          row.appendChild(h("label", { text: inp.label || inp.key }));
          var el;
          if(inp.type === "select"){
            el = h("select");
            (inp.options||[]).forEach(function(o){
              var op = h("option", { value: o.v, text: o.label != null ? o.label : o.v });
              el.appendChild(op);
            });
            if(inp.default != null) el.value = inp.default;
          } else if(inp.type === "textarea"){
            el = h("textarea");
            el.style.minHeight = "64px";
            if(inp.default != null) el.value = inp.default;
          } else {
            el = h("input", { type: inp.type === "number" ? "text" : (inp.type || "text"),
              inputmode: inp.type === "number" ? "decimal" : null });
            if(inp.placeholder) el.placeholder = inp.placeholder;
            if(inp.default != null) el.value = inp.default;
          }
          el.id = "st-in-" + inp.key;
          fieldEls[inp.key] = { cfg: inp, el: el };
          row.appendChild(el);
          if(inp.unit) row.appendChild(h("span", { class:"st-u", text: inp.unit }));
          inCard.appendChild(row);
        });
        root.appendChild(inCard);
      }

      // 结果区
      var outInner = cfg.outInner || null;   // 自定义结果容器
      var outCard = h("div", { class:"st-card" });
      outCard.appendChild(h("div", { class:"st-lbl", text: cfg.outLabel || "结果" }));
      var outBody = outInner || h("div", { class:"st-out" });
      outCard.appendChild(outBody);
      root.appendChild(outCard);

      // 锚点/说明
      if(cfg.anchors && cfg.anchors.length){
        var ac = h("div", { class:"st-card st-anchor" });
        ac.appendChild(h("div", { class:"st-lbl", text: cfg.anchorLabel || "参考" }));
        cfg.anchors.forEach(function(a){ ac.appendChild(h("div", { class:"st-a", text:a })); });
        root.appendChild(ac);
      }

      // 版本号
      root.appendChild(h("div", { class:"st-ver", text: cfg.version || this.version }));

      // ===== 收集输入 → 计算 → 渲染 =====
      var parseVal = function(f){
        var raw = f.el.value;
        if(f.cfg.type === "select"){
          var n = Number(raw);
          return isNaN(n) ? raw : n;
        }
        if(f.cfg.type === "number"){
          if(String(raw).trim() === "") return NaN;
          return Number(raw);
        }
        return raw;
      };

      var render = function(res){
        if(outInner){ // 自定义结果渲染：交给 cfg.render
          if(cfg.render) outBody.innerHTML = cfg.render(res, fieldEls);
          return;
        }
        if(res == null){ outBody.textContent = cfg.emptyHint || "填写参数后自动计算"; outBody.className = "st-out"; return; }
        if(res.error){ outBody.className = "st-err"; outBody.textContent = "⚠ " + res.error; return; }
        outBody.className = "st-out";
        if(res.rows){
          outInner = h("div", { class:"st-rows" });
          outBody.replaceWith(outInner);
          outBody = outInner;
          outBody.innerHTML = res.rows.map(function(r){
            return '<div class="st-r"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>';
          }).join("");
        } else {
          outBody.innerHTML = '<span class="st-big">'+fmt(res.value)+'</span> '+(res.unit||"")+
            (res.note?('<small>'+res.note+'</small>'):"");
        }
      };

      var run = function(){
        var v = {};
        var missing = false;
        for(var k in fieldEls){
          var val = parseVal(fieldEls[k]);
          v[k] = val;
          if(fieldEls[k].cfg.type === "number" && (typeof val !== "number" || isNaN(val))) missing = true;
        }
        if(missing && !cfg.allowPartial){ render(null); return; }
        var res;
        try { res = cfg.compute(v); }
        catch(e){ res = { error: e.message }; }
        render(res);
      };

      for(var k in fieldEls){
        fieldEls[k].el.addEventListener("input", run);
        fieldEls[k].el.addEventListener("change", run);
      }
      // 自定义按钮
      if(cfg.button){
        var b = h("button", { class:"st-btn", text: cfg.button });
        b.onclick = run;
        outCard.appendChild(b);
      }

      run();
      return { run: run, fields: fieldEls, root: root };
    },

    // 工具函数（供 compute 使用）
    fmt: fmt,
    h: h,
  };

  // 暴露（唯一全局）
  window.StandardTool = StandardTool;
})();
