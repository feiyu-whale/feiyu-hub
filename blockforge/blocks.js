/* ============================================================
   积木工坊 · 块定义库 v1.0.0
   ------------------------------------------------------------
   每个块 = 一个独立功能单元。约定如下：
   {
     id:       唯一标识
     name:     显示名
     icon:     图标字符
     cat:      分类（data / ui / logic）
     desc:     一句话说明
     inputs:   输入端口（数组，每项 {key,name,type}）
     outputs:  输出端口
     fields:   可配置字段（画在块里，用户直接填）
     render:   (cfg) => 返回 DOM HTML 字符串（导出时用）
     schema:   () => 返回该块产出的数据结构（JSON 说明）
   }
   端口 type：any / list / record / scalar
   只有 type 兼容（same 或 any）才允许连线。
   ============================================================ */

const BF_BLOCKS = [

  /* ---------- 数据层 ---------- */
  {
    id: 'ds.items',
    name: '数据表',
    icon: '▤',
    cat: 'data',
    desc: '一张表，存记录。别的块都从这儿拿数据。',
    inputs: [],
    outputs: [{ key: 'rows', name: '行', type: 'list' }],
    fields: [
      { key: 'table', name: '表名', type: 'text', def: 'orders' },
      { key: 'seed', name: '初始数据', type: 'json', def: '[]' }
    ],
    schema: () => ({ rows: 'array<object>' })
  },
  {
    id: 'ds.fields',
    name: '字段定义',
    icon: '⌗',
    cat: 'data',
    desc: '定义一行里有哪些字段、什么类型。',
    inputs: [{ key: 'in', name: '数据', type: 'list' }],
    outputs: [{ key: 'out', name: '带结构', type: 'list' }],
    fields: [
      { key: 'fields', name: '字段', type: 'lines', def: 'id:文字\nname:文字\namount:数字\nstatus:文字' }
    ],
    schema: () => ({ fields: 'array<{name,type}>' })
  },

  /* ---------- 界面层 ---------- */
  {
    id: 'ui.list',
    name: '列表',
    icon: '☰',
    cat: 'ui',
    desc: '把一组数据显示成列表，可搜索。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [],
    fields: [
      { key: 'title', name: '标题', type: 'text', def: '列表' },
      { key: 'fields', name: '显示字段', type: 'text', def: 'name,status' },
      { key: 'search', name: '可搜索', type: 'bool', def: true }
    ],
    schema: () => ({})
  },
  {
    id: 'ui.form',
    name: '表单',
    icon: '✎',
    cat: 'ui',
    desc: '一组输入框，提交后写进数据表。',
    inputs: [{ key: 'target', name: '写入到', type: 'list' }],
    outputs: [],
    fields: [
      { key: 'title', name: '标题', type: 'text', def: '新建' },
      { key: 'fields', name: '字段', type: 'text', def: 'name,amount' },
      { key: 'submit', name: '按钮文字', type: 'text', def: '提交' }
    ],
    schema: () => ({})
  },
  {
    id: 'ui.detail',
    name: '详情',
    icon: '◫',
    cat: 'ui',
    desc: '点列表某一行，展开看全部字段。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [],
    fields: [
      { key: 'title', name: '标题', type: 'text', def: '详情' }
    ],
    schema: () => ({})
  },
  {
    id: 'ui.stat',
    name: '统计卡',
    icon: '◈',
    cat: 'ui',
    desc: '一行数字，比如总单量、总额。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [],
    fields: [
      { key: 'metric', name: '统计项', type: 'text', def: 'count' },
      { key: 'label', name: '标签', type: 'text', def: '总数' }
    ],
    schema: () => ({})
  },
  {
    id: 'ui.nav',
    name: '导航条',
    icon: '☷',
    cat: 'ui',
    desc: '页面顶部的菜单。',
    inputs: [],
    outputs: [],
    fields: [
      { key: 'brand', name: '站名', type: 'text', def: '我的系统' },
      { key: 'items', name: '菜单项', type: 'text', def: '首页,列表,我的' }
    ],
    schema: () => ({})
  },

  /* ---------- 逻辑层 ---------- */
  {
    id: 'lg.timer',
    name: '定时器',
    icon: '◷',
    cat: 'logic',
    desc: '每隔一段时间跑一次。',
    inputs: [],
    outputs: [{ key: 'tick', name: '触发', type: 'any' }],
    fields: [
      { key: 'every', name: '间隔(秒)', type: 'number', def: 60 }
    ],
    schema: () => ({})
  },
  {
    id: 'lg.wallet',
    name: '钱包',
    icon: '◉',
    cat: 'logic',
    desc: '虚拟余额，能加能扣，不可充值提现。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [{ key: 'balance', name: '余额', type: 'scalar' }],
    fields: [
      { key: 'account', name: '账户名', type: 'text', def: 'main' },
      { key: 'init', name: '初始余额', type: 'number', def: 1000 },
      { key: 'unit', name: '单位', type: 'text', def: '白饭' }
    ],
    schema: () => ({ balance: 'number' })
  },
  {
    id: 'lg.flow',
    name: '状态流转',
    icon: '⇄',
    cat: 'logic',
    desc: '定义状态怎么走，非法的跳转直接拒绝。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [{ key: 'out', name: '受控', type: 'list' }],
    fields: [
      { key: 'field', name: '状态字段', type: 'text', def: 'status' },
      { key: 'states', name: '状态', type: 'text', def: '待接单,进行中,已完成,已取消' },
      { key: 'rules', name: '流转规则', type: 'lines', def: '待接单>进行中\n待接单>已取消\n进行中>已完成\n进行中>已取消' }
    ],
    schema: () => ({ out: 'array<object>' })
  },
  {
    id: 'lg.cond',
    name: '条件判断',
    icon: '◇',
    cat: 'logic',
    desc: '满足条件走一路，不满足走另一路。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [
      { key: 'yes', name: '满足', type: 'list' },
      { key: 'no', name: '不满足', type: 'list' }
    ],
    fields: [
      { key: 'field', name: '判断字段', type: 'text', def: 'amount' },
      { key: 'op', name: '比较符', type: 'text', def: '>=' },
      { key: 'value', name: '比较值', type: 'text', def: '100' }
    ],
    schema: () => ({ yes: 'array<object>', no: 'array<object>' })
  },
  {
    id: 'ui.button',
    name: '按钮',
    icon: '▭',
    cat: 'ui',
    desc: '点一下执行一串动作。',
    inputs: [{ key: 'rows', name: '数据', type: 'list' }],
    outputs: [],
    fields: [
      { key: 'text', name: '文字', type: 'text', def: '点我' },
      { key: 'action', name: '动作', type: 'select', def: 'alert', options: ['alert', '清空数据', '导出数据'] }
    ],
    schema: () => ({})
  }
];

/* ============================================================
   自定义块：用户自己造的块，存在 localStorage['bf.customBlocks']
   结构同内置块，但 render 由用户填的「模板」决定
   ============================================================ */

const BF_CUSTOM_KEY = 'bf.customBlocks';

function bfLoadCustom() {
  try {
    const raw = localStorage.getItem(BF_CUSTOM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function bfSaveCustom(arr) {
  try { localStorage.setItem(BF_CUSTOM_KEY, JSON.stringify(arr)); } catch (e) {}
}

function bfAddCustom(def) {
  const arr = bfLoadCustom();
  arr.push(def);
  bfSaveCustom(arr);
  return arr;
}

function bfRemoveCustom(id) {
  const arr = bfLoadCustom().filter(b => b.id !== id);
  bfSaveCustom(arr);
  return arr;
}

/* 全部块 = 内置 + 接口 + 自定义 */
function bfAllBlocks() {
  const api = (typeof BF_API_BLOCKS !== 'undefined') ? BF_API_BLOCKS : [];
  return BF_BLOCKS.concat(api).concat(bfLoadCustom());
}

/* 分类显示名 */
const BF_CATS = {
  data: '数据',
  ui: '界面',
  logic: '逻辑',
  api: '接口',
  custom: '我的块'
};

/* 端口类型兼容判断 */
function bfPortCompatible(a, b) {
  if (!a || !b) return false;
  if (a === 'any' || b === 'any') return true;
  return a === b;
}

/* 按 id 取块定义（含自定义） */
function bfBlockDef(id) {
  return bfAllBlocks().find(b => b.id === id) || null;
}

/* 获取默认配置 */
function bfDefaultCfg(def) {
  const cfg = {};
  (def.fields || []).forEach(f => { cfg[f.key] = f.def; });
  return cfg;
}
