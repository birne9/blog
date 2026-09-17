<template>
    <!-- 高度 = 视口 - 顶栏高度(移动 90px, 桌面 144px), 随断点切换 -->
    <div class="w-full h-[calc(100vh-90px)] md:h-[calc(100vh-144px)] bg-[url('../../static/images/bigsea.jpeg')] bg-center bg-[length:100%_100%] flex items-center justify-center">
        <div class="flex flex-col items-center px-5 box-border">
            <div class="flex justify-center cursor-pointer">
                <img class="h-[100px] w-[100px]" src="../../static/images/wx_avatar.jpg" alt="birne9" title="birne9" />
            </div>
            <!-- 流体字号: 小屏最小 24px, 常规屏约 32px -->
            <div class="text-center text-white font-semibold mt-[10px] text-[clamp(24px,8vw,32px)]">🌈 We are who we choose to be.</div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
