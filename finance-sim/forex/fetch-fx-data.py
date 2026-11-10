#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
抓取真实历史汇率（frankfurter / 欧洲央行）
用 curl 取数据（urllib 在本机卡住，curl 正常）
2026-10-24 肥鱼
"""
import json, subprocess, time, os

OUT = 'finance-sim/forex/fx-data.json'
BASE = 'https://api.frankfurter.app'

PAIRS = {
    'USD/CNY': ('USD', 'CNY'),
    'EUR/USD': ('EUR', 'USD'),
    'USD/JPY': ('USD', 'JPY'),
    'GBP/USD': ('GBP', 'USD'),
    'AUD/USD': ('AUD', 'USD'),
    'USD/CHF': ('USD', 'CHF'),
    'USD/HKD': ('USD', 'HKD'),
    'USD/CAD': ('USD', 'CAD'),
}

SEGMENTS = [(f'{y}-01-01', f'{y}-12-31') for y in range(2000, 2027)]

def curl_json(url, timeout=45):
    try:
        r = subprocess.run(
            ['curl', '-sL', '-m', str(timeout), url],
            capture_output=True, timeout=timeout + 10
        )
        if r.returncode != 0:
            return None
        txt = r.stdout.decode('utf-8', 'ignore').strip()
        if not txt or txt.startswith('{ "message"') or '"message"' in txt[:60]:
            return None
        return json.loads(txt)
    except Exception:
        return None

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    result = {}

    for pair, (b, q) in PAIRS.items():
        print(f'=== {pair} ===', flush=True)
        all_data = {}
        for s, e in SEGMENTS:
            url = f'{BASE}/{s}..{e}?from={b}&to={q}'
            d = curl_json(url)
            if d and isinstance(d.get('rates'), dict):
                got = 0
                for day, v in d['rates'].items():
                    val = v.get(q)
                    if val:
                        all_data[day] = float(val)
                        got += 1
                print(f'  {s[:4]}: {got} 天', end='  ', flush=True)
            else:
                print(f'  {s[:4]}: 失败', end='  ', flush=True)
            time.sleep(0.6)
        print('', flush=True)

        if all_data:
            days = sorted(all_data.keys())
            vals = [all_data[d] for d in days]
            result[pair] = {
                'dates': days,
                'rates': [round(v, 6) for v in vals],
                'min': round(min(vals), 6),
                'max': round(max(vals), 6),
                'count': len(days),
                'first': days[0],
                'last': days[-1],
            }
            print(f'  ✅ {pair}: {len(days)} 天 {days[0]}~{days[-1]} 范围 {min(vals):.4f}~{max(vals):.4f}\n', flush=True)
        else:
            print(f'  ❌ {pair}: 无数据\n', flush=True)

    payload = {
        'source': 'frankfurter.app (European Central Bank reference rates)',
        'fetched': time.strftime('%Y-%m-%d %H:%M:%S'),
        'pairs': result,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, separators=(',', ':'))
    size = os.path.getsize(OUT)
    print(f'\n✅ 写入 {OUT} ({size/1024:.0f} KB)')
    print(f'   货币对: {len(result)} 个')
    for p, v in result.items():
        print(f'   {p}: {v["count"]} 天 ({v["first"]}~{v["last"]}) {v["min"]}~{v["max"]}')

if __name__ == '__main__':
    main()
