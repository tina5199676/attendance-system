import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * 監聽元素尺寸變化的 composable。
 * SVG 圖表需要知道容器實際寬度才能計算座標，用 ResizeObserver 比 window resize 更精準，
 * 容器因側邊欄收合而改變寬度時也會觸發。
 */
export function useElementSize(target: Ref<HTMLElement | null>) {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | undefined

  onMounted(() => {
    if (!target.value) return
    observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      width.value = entry.contentRect.width
      height.value = entry.contentRect.height
    })
    observer.observe(target.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { width, height }
}
