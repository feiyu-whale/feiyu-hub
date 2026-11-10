/**
 * nativeSave.ts —— 安卓（Capacitor）原生保存 / 分享
 *
 * 干什么：APK 里 WebView 不支持 <a download> 下载，这里改用系统文件 + 分享面板。
 * 依赖：@capacitor/filesystem、@capacitor/share（网页环境会自动跳过）
 * 输入：Blob + 文件名；输出：写入缓存目录并弹出系统分享
 */

export function isNative(): boolean {
  const cap = (window as any).Capacitor
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform())
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const s = String(fr.result || '')
      resolve(s.slice(s.indexOf(',') + 1))
    }
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

export async function saveBlobNative(blob: Blob, filename: string): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const { Share } = await import('@capacitor/share')

  const data = await blobToBase64(blob)
  const res = await Filesystem.writeFile({
    path: filename,
    data,
    directory: Directory.Cache,
    recursive: true,
  })

  await Share.share({
    title: filename,
    text: '肥鱼剪辑台导出',
    url: res.uri,
    dialogTitle: '保存 / 分享视频',
  })
}
