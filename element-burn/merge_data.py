#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 21-118 号元素数据合并进 element-burn/index.html
数据文件：elements_21_118.py
"""
import json, re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(BASE, 'index.html')

sys.path.insert(0, BASE)
from elements_21_118 import ELEMENTS

def js_escape(s):
    return json.dumps(s, ensure_ascii=False)

def to_js(d):
    parts = [
        f"{js_escape('z')}:{d['z']}",
        f"{js_escape('sym')}:{js_escape(d['sym'])}",
        f"{js_escape('cn')}:{js_escape(d['cn'])}",
        f"{js_escape('cat')}:{js_escape(d['cat'])}",
        f"{js_escape('mass')}:{js_escape(d['mass'])}",
        f"{js_escape('variants')}:{js_escape(d['variants'])}",
        f"{js_escape('burn')}:{js_escape(d['burn'])}",
        f"{js_escape('e')}:{js_escape(d['e'])}",
        f"{js_escape('unit')}:{js_escape(d['unit'])}",
        f"{js_escape('per')}:{js_escape(d['per'])}",
        f"{js_escape('use')}:{js_escape(d['use'])}",
        f"{js_escape('note')}:{js_escape(d['note'])}",
    ]
    return "{" + ",".join(parts) + "}"

html = open(HTML, encoding='utf-8').read()

# 找到 DATA 数组结尾
m = re.search(r'(const DATA = \[\n)(.*?)(\n\];)', html, re.S)
if not m:
    print("ERROR: 找不到 DATA 数组"); sys.exit(1)

head, body, tail = m.group(1), m.group(2), m.group(3)

existing = set(int(x) for x in re.findall(r'\{z:(\d+),', body))
print(f"现有元素: {len(existing)} 个（{min(existing)}-{max(existing)}）")

# 只追加新元素
new_lines = []
added = 0
for d in ELEMENTS:
    if d['z'] in existing:
        continue
    new_lines.append(to_js(d) + ",")
    added += 1

if not new_lines:
    print("没有新元素要加")
    sys.exit(0)

new_body = body.rstrip()
# 去掉末尾逗号再加
if new_body.endswith(','):
    new_body = new_body[:-1]
new_body = new_body + ",\n" + "\n".join(new_lines)
new_body = new_body.rstrip(',')  # 最后不留逗号（JS 允许但保持一致）

html_new = html[:m.start()] + head + new_body + tail + html[m.end():]
open(HTML, 'w', encoding='utf-8').write(html_new)

total = len(existing) + added
print(f"新增 {added} 个，总计 {total} 个")
