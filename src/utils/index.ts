// 判断是否为移动端
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
}
  