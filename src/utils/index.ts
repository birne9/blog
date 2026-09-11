// PC 与移动端布局的响应式断点（px）
export const MOBILE_BREAKPOINT = 768;

// 判断当前视口宽度是否命中移动端布局（响应式，随窗口变化）
export function isMobileScreen() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

// 判断是否是移动端设备（UA 检测，仅作补充参考）
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // 是否移动端
}
