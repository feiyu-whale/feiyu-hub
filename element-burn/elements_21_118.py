# -*- coding: utf-8 -*-
"""合并 21-118 全部数据"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elements_b1 import BATCH1
from elements_b2 import BATCH2
from elements_b3 import BATCH3

ELEMENTS = BATCH1 + BATCH2 + BATCH3
