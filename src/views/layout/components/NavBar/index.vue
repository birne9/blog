<template>
    <header class="navbar">
        <div class="navbar_inner">
            <div class="navbar_left">
                <div class="navbar_logo" @click="skipPage('/')" title="Home">
                    <img src="../../../../static/images/wx_avatar.jpg" alt="birne9" />
                </div>
                <nav class="navbar_links" aria-label="主导航">
                    <div class="navbar_link" @click="skipPage('/')">Home</div>
                    <div class="navbar_link" @click="skipPage('/article')">Article</div>
                    <div class="navbar_link" @click="skipPage('/concept')">Concept</div>
                    <div class="navbar_link" @click="skipPage('/author')">Author</div>
                </nav>
            </div>
            <div class="navbar_right">
                <button class="navbar_toggle" :class="{ open: menuOpen }" type="button"
                    aria-label="打开菜单" :aria-expanded="menuOpen" @click="toggleMenu">
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
            </div>
        </div>
        <transition name="menu">
            <div v-if="menuOpen" class="menu_overlay">
                <nav class="menu_items" aria-label="移动端导航">
                    <div class="menu_item" @click="skipPage('/')">Home</div>
                    <div class="menu_item" @click="skipPage('/article')">Article</div>
                    <div class="menu_item" @click="skipPage('/concept')">Concept</div>
                    <div class="menu_item" @click="skipPage('/author')">Author</div>
                </nav>
                <div class="menu_slogan">🌈 We are who we choose to be.</div>
            </div>
        </transition>
    </header>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 移动端菜单开关(≥768px 时菜单由 CSS 隐藏, 内联导航出现)
const menuOpen = ref(false)
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
}
const skipPage = (path: string) => {
    menuOpen.value = false
    router.push(path)
}
// 菜单打开时锁定页面滚动, 关闭或组件卸载时恢复
watch(menuOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
    document.body.style.overflow = ''
})
</script>
<style lang="less" scoped>
/* 移动优先: 顶部栏 + 汉堡按钮 + 全屏菜单 */
.navbar {
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;

    .navbar_inner {
        height: 90px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .navbar_left {
        display: flex;
        align-items: center;
    }

    .navbar_logo {
        cursor: pointer;
        img {
            width: 44px;
            height: 44px;
            display: block;
        }
    }

    /* 内联导航仅桌面显示 */
    .navbar_links {
        display: none;
    }

    .navbar_right {
        display: flex;
        align-items: center;
    }

    /* 汉堡按钮: 44px 点击热区(移动端最小可点尺寸) */
    .navbar_toggle {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        width: 44px;
        height: 44px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;

        .bar {
            width: 22px;
            height: 2px;
            background-color: #333;
            transition: transform 0.3s ease;
        }

        &.open {
            .bar:nth-child(1) {
                transform: translateY(3.5px) rotate(-45deg);
            }
            .bar:nth-child(2) {
                transform: translateY(-3.5px) rotate(45deg);
            }
        }
    }

    /* 全屏菜单(仅移动端) */
    .menu_overlay {
        position: fixed;
        top: 91px;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
        background-color: #fff;
        border-top: 1px solid #f5f5f5;
        display: flex;
        flex-direction: column;
        overflow-y: auto;

        .menu_items {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 64px;

            .menu_item {
                width: 100%;
                text-align: center;
                padding: 18px 0;
                font-size: 24px;
                font-weight: 600;
                color: #000;
                cursor: pointer;
            }
        }

        .menu_slogan {
            margin: auto auto 48px;
            width: calc(100% - 40px);
            max-width: 400px;
            background-color: #fc7e0f;
            color: #fff;
            font-size: 16px;
            border-radius: 30px;
            text-align: center;
            box-sizing: border-box;
            padding: 12px 20px;
        }
    }
}

/* 菜单出现动画(左上角缩放) */
.menu-enter-active {
    animation: menu-scale-in 0.3s ease both;
}
.menu-leave-active {
    animation: menu-scale-in 0.2s ease reverse both;
}
@keyframes menu-scale-in {
    0% {
        transform: scale(0.7);
        transform-origin: top right;
        opacity: 0;
    }
    100% {
        transform: scale(1);
        transform-origin: top right;
        opacity: 1;
    }
}

/* ≥768px: 桌面导航 */
@media (min-width: 768px) {
    .navbar {
        .navbar_inner {
            height: 144px;
            max-width: 1140px;
            margin: 0 auto;
        }

        .navbar_links {
            display: flex;
            align-items: center;

            .navbar_link {
                font-weight: 500;
                font-size: 18px;
                color: #000;
                margin-left: 30px;
                cursor: pointer;
                transition: color 0.2s ease;

                &:hover {
                    color: #fc7e0f;
                }
            }
        }

        .navbar_toggle,
        .menu_overlay {
            display: none;
        }
    }
}
</style>
