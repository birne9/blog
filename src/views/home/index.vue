<template>
    <div class="home">
        <div class="home_center">
            <div class="home_avatar">
                <img src="../../static/images/wx_avatar.jpg" alt="birne9" title="birne9" />
            </div>
            <div class="home_desc">🌈 We are who we choose to be.</div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
.home {
    background-image: url("../../static/images/bigsea.jpeg");
    width: 100%;
    /* 高度 = 视口 - 顶栏高度(移动 90px, 桌面 144px), 随断点切换 */
    height: calc(100vh - 90px);
    background-position: center center;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .home_center {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .home_avatar {
        cursor: pointer;
        display: flex;
        justify-content: center;

        img {
            width: 100px;
            height: 100px;
        }
    }

    .home_desc {
        text-align: center;
        color: #fff;
        font-weight: 600;
        margin-top: 10px;
        /* 流体字号: 小屏最小 24px, 常规屏约 32px */
        font-size: clamp(24px, 8vw, 32px);
    }
}

@media (min-width: 768px) {
    .home {
        height: calc(100vh - 144px);
    }
}
</style>
