#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性生成 element-burn/index.html 的 DATA 数组
数据源：elements_base20.json (1-20) + elements_b1/b2/b3 (21-118) + supplement_data
"""
import json, io, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

from elements_21_118 import ELEMENTS as E21
from supplement_data import SUPPLEMENT
from supplement3 import SUPP3

base20 = json.load(io.open(os.path.join(BASE, 'elements_base20.json'), encoding='utf-8'))

# 统一成 dict，键：z sym cn cat mass variants burn e unit per use note
all_elems = []
for d in base20:
    all_elems.append({
        'z': d['z'], 'sym': d['sym'], 'cn': d['cn'], 'cat': d['cat'],
        'mass': d['mass'], 'variants': d['variants'], 'burn': d['burn'],
        'e': d['e'], 'unit': d['unit'], 'per': d.get('per', ''),
        'use': d['use'], 'note': d['note'],
    })
for d in E21:
    all_elems.append({
        'z': d['z'], 'sym': d['sym'], 'cn': d['cn'], 'cat': d['cat'],
        'mass': d['mass'], 'variants': d['variants'], 'burn': d['burn'],
        'e': d['e'], 'unit': d['unit'], 'per': d.get('per', ''),
        'use': d['use'], 'note': d['note'],
    })

all_elems.sort(key=lambda x: x['z'])
assert len(all_elems) == 118, f'元素数不对: {len(all_elems)}'
assert [e['z'] for e in all_elems] == list(range(1, 119)), '号不连续'

# 合并补充数据
for e in all_elems:
    sup = SUPPLEMENT.get(e['z'])
    if sup:
        per_g, fire, mp, bp = sup
        e['per'] = per_g              # 统一用 kJ/g 纯数字
        e['fire'] = fire
        e['mp'] = mp
        e['bp'] = bp
    else:
        e['fire'] = e['mp'] = e['bp'] = ''

for e in all_elems:
    s3 = SUPP3.get(e['z'])
    if s3:
        density, abundance, discover, autoign, compounds = s3
        e['density'] = density
        e['abund'] = abundance
        e['disc'] = discover
        e['autoign'] = autoign
        e['comp'] = compounds
    else:
        e['density'] = e['abund'] = e['disc'] = e['autoign'] = e['comp'] = ''

ORDER = ['z','sym','cn','cat','mass','variants','burn','e','unit','per','fire','mp','bp',
         'density','abund','disc','autoign','comp','use','note']

lines = []
for e in all_elems:
    parts = []
    for k in ORDER:
        v = e.get(k, '')
        if k == 'z':
            parts.append(f'z:{v}')
        else:
            parts.append(f'{k}:{json.dumps(str(v), ensure_ascii=False)}')
    lines.append('{' + ','.join(parts) + '}')

data_js = ',\n'.join(lines)
io.open(os.path.join(BASE, 'data_generated.js'), 'w', encoding='utf-8').write(data_js)
print(f'生成 {len(all_elems)} 个元素，写入 data_generated.js（{len(data_js)} 字节）')
