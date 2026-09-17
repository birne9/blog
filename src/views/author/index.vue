<template>
    <!-- 移动优先: 头像 + 信息卡片, 社交图标内联在名字行; 桌面端图标独立显示在卡片右侧 -->
    <div class="container-page pt-5 pb-10 md:pt-10">
        <div class="flex w-full bg-card rounded-xl p-5 box-border md:max-w-[666px] md:mx-auto md:h-[166px] md:items-center md:justify-around">
            <div class="shrink-0 h-[66px] w-[66px]">
                <img class="block h-full w-full rounded-full" src="../../static/images/wx_avatar.jpg" alt="avatar" title="birne9" />
            </div>
            <div class="ml-5 min-w-0 box-border md:px-5">
                <div class="flex items-center justify-between gap-2 text-lg font-bold text-foreground mb-[5px]">
                    birne9
                    <div class="flex items-center shrink-0 md:hidden">
                        <a class="flex h-[25px] w-[25px]" href="https://github.com/birne9" target="_blank" rel="noopener noreferrer" title="birne9">
                            <img class="block h-[25px] w-[25px]" src="../../static/svg/github.svg" alt="GitHub" />
                        </a>
                        <a class="flex h-[25px] w-[25px] ml-5" href="https://juejin.cn/user/3281406576841406" target="_blank" rel="noopener noreferrer" title="birne9">
                            <img class="block h-[25px] w-[25px]" src="../../static/svg/juejin.svg" alt="掘金" />
                        </a>
                    </div>
                </div>
                <div class="text-sm text-subtle">A Front-End Developer</div>
                <div class="mt-[10px] text-sm font-medium text-foreground">Skill：Vue、React、Node、H5、Hybrid App...</div>
            </div>
            <div class="hidden md:flex md:items-center md:mt-5 md:self-start">
                <a class="flex h-[25px] w-[25px]" href="https://github.com/birne9" target="_blank" rel="noopener noreferrer" title="birne9">
                    <img class="block h-[25px] w-[25px]" src="../../static/svg/github.svg" alt="GitHub" />
                </a>
                <a class="flex h-[25px] w-[25px] ml-5" href="https://juejin.cn/user/3281406576841406" target="_blank" rel="noopener noreferrer" title="birne9">
                    <img class="block h-[25px] w-[25px]" src="../../static/svg/juejin.svg" alt="掘金" />
                </a>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
