/**
 * bundle.ts —— 工程打包导出（zip）
 *
 * 干什么：把工程 JSON + 全部素材文件打成一个 zip，换设备/交给别人就能继续剪。
 * 依赖：jszip
 * 输入：序列化的工程对象 + 素材列表；输出：zip Blob
 */

import JSZip from 'jszip'
import type { MediaAsset } from '../stores/project'

export async function buildProjectZip(
  projectJson: any,
  assets: MediaAsset[],
  onProgress?: (p: number, msg: string) => void,
): Promise<Blob> {
  const zip = new JSZip()
  const folder = zip.folder('media')!

  zip.file('project.json', JSON.stringify(projectJson, null, 2))
  zip.file('README.txt',
    [
      '肥鱼剪辑台 · 工程包',
      '',
      'project.json  时间轴与序列数据',
      'media/        素材原文件（按文件名对应）',
      '',
      '换设备后：打开剪辑台 → 导入 media 里的素材 → 再打开本工程即可继续编辑。',
      '（当前版本暂不支持一键重新链接素材，需要手动重新导入。）',
    ].join('\n'))

  const used = new Set<string>()
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i]
    let name = a.name || `asset-${i}`
    if (used.has(name)) name = `${i}-${name}`
    used.add(name)
    try {
      folder.file(name, a.file)
    } catch {
      // 单个素材失败不影响整体
    }
    onProgress?.((i + 1) / Math.max(1, assets.length), `打包 ${i + 1}/${assets.length}`)
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 3 } })
  return blob
}
