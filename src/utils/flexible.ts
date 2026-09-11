// 移动端 rem 适配
// 根字号 = 视口宽度 / 10（与 amfe-flexible 一致，对应 375 设计稿、postcss-pxtorem rootValue 37.5）
// 设置上限：视口超过 540px 时不再等比放大，
// 避免平板、桌面端缩小窗口时 H5 页面（rem 布局）被过度放大
const MAX_FONT_SIZE = 54;
// 视口宽度低于该值时根字号才会跟随变化（375 设计稿基准）
const MAX_LAYOUT_WIDTH = 540;

function setRem() {
    const width =
        document.documentElement.clientWidth || window.innerWidth;
    const fontSize = Math.min(width / 10, MAX_FONT_SIZE);
    document.documentElement.style.fontSize = `${fontSize}px`;
}

setRem();
// 窗口变化（缩放、横竖屏切换）时重新计算
window.addEventListener('resize', setRem);
// 页面从缓存恢复时重新计算
window.addEventListener('pageshow', (e) => {
    if (e.persisted) setRem();
});

export { MAX_FONT_SIZE, MAX_LAYOUT_WIDTH };
