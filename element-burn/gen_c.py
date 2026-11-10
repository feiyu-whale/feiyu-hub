#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 C 版：真周期表布局（18列网格 + 镧系锕系抽出）"""
import re, io, os, json

BASE = os.path.dirname(os.path.abspath(__file__))
data = io.open(os.path.join(BASE, 'data_generated.js'), encoding='utf-8').read()

# 解析成 python dict 列表
elems = []
for blk in re.split(r'\},\s*\{', data.strip()):
    blk = blk.strip().lstrip('{').rstrip('}')
    d = {}
    for k in re.findall(r'(\w+):', blk):
        if k in d: continue
        m = re.search(rf'(?<![\w]){k}:(?:"((?:[^"\\]|\\.)*)"|(\d+))', blk)
        if m:
            d[k] = m.group(1) if m.group(1) is not None else m.group(2)
        else:
            d[k] = ''
    if d.get('sym'):
        d['z'] = int(d.get('z', 0) or 0)
        elems.append(d)

elems.sort(key=lambda x: x['z'])
assert len(elems) == 118, len(elems)

# 周期表坐标（18 列）
# (row, col) 1-based；镧系 57-71 -> 第 9 行 col 3..17；锕系 89-103 -> 第 10 行 col 3..17
POS = {
 1:(1,1), 2:(1,18),
 3:(2,1),4:(2,2), 5:(2,13),6:(2,14),7:(2,15),8:(2,16),9:(2,17),10:(2,18),
 11:(3,1),12:(3,2), 13:(3,13),14:(3,14),15:(3,15),16:(3,16),17:(3,17),18:(3,18),
 19:(4,1),20:(4,2), 21:(4,3),22:(4,4),23:(4,5),24:(4,6),25:(4,7),26:(4,8),27:(4,9),28:(4,10),29:(4,11),30:(4,12), 31:(4,13),32:(4,14),33:(4,15),34:(4,16),35:(4,17),36:(4,18),
 37:(5,1),38:(5,2), 39:(5,3),40:(5,4),41:(5,5),42:(5,6),43:(5,7),44:(5,8),45:(5,9),46:(5,10),47:(5,11),48:(5,12), 49:(5,13),50:(5,14),51:(5,15),52:(5,16),53:(5,17),54:(5,18),
 55:(6,1),56:(6,2), 57:(8,3),72:(6,4),73:(6,5),74:(6,6),75:(6,7),76:(6,8),77:(6,9),78:(6,10),79:(6,11),80:(6,12),81:(6,13),82:(6,14),83:(6,15),84:(6,16),85:(6,17),86:(6,18),
 87:(7,1),88:(7,2), 89:(9,3),104:(7,4),105:(7,5),106:(7,6),107:(7,7),108:(7,8),109:(7,9),110:(7,10),111:(7,11),112:(7,12),113:(7,13),114:(7,14),115:(7,15),116:(7,16),117:(7,17),118:(7,18),
}
# 镧系 57-71 -> row 8, col 3..17 ; 锕系 89-103 -> row 9, col 3..17
for i, z in enumerate(range(57, 72)):
    POS[z] = (8, 3 + i)
for i, z in enumerate(range(89, 104)):
    POS[z] = (9, 3 + i)

for e in elems:
    e['row'], e['col'] = POS[e['z']]

CAT_COLOR = {
 '非金属':'#3fb27f','稀有气体':'#8b7bd8','碱金属':'#e05c5c','碱土金属':'#e08c3c',
 '过渡金属':'#4a8fd4','主族金属':'#5aa9a9','类金属':'#7fa83f','卤素':'#d4c04a',
 '镧系':'#c76fa8','锕系':'#a05f9e',
}

def esc(v):
    return json.dumps(str(v), ensure_ascii=False)

js_rows = []
for e in elems:
    js_rows.append(
      '{z:%d,row:%d,col:%d,sym:%s,cn:%s,cat:%s,mass:%s,variants:%s,burn:%s,e:%s,unit:%s,'
      'per:%s,fire:%s,mp:%s,bp:%s,density:%s,abund:%s,disc:%s,autoign:%s,comp:%s,use:%s,note:%s}'
      % (e['z'], e['row'], e['col'], esc(e['sym']), esc(e['cn']), esc(e['cat']), esc(e['mass']),
         esc(e['variants']), esc(e['burn']), esc(e['e']), esc(e['unit']), esc(e['per']),
         esc(e['fire']), esc(e['mp']), esc(e['bp']), esc(e['density']), esc(e['abund']),
         esc(e['disc']), esc(e['autoign']), esc(e['comp']), esc(e['use']), esc(e['note'])))

io.open(os.path.join(BASE, 'data_c.js'), 'w', encoding='utf-8').write(',\n'.join(js_rows))
io.open(os.path.join(BASE, 'cat_color.json'), 'w', encoding='utf-8').write(json.dumps(CAT_COLOR, ensure_ascii=False))
print('data_c.js 生成完成，%d 个元素' % len(js_rows))
print('周期表占用格数:', len(POS))
