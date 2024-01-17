<template>
    <div class="author">
        <author-h5 v-if='isMobile'></author-h5>
        <author-pc v-else></author-pc>
    </div>
</template>
<script setup lang="ts">
import authorH5 from './author-h5.vue';
import authorPc from './author-pc.vue';
import { useDeviceStoreHook } from "@/store/device/index"
// 获取设备store
const deviceStore = useDeviceStoreHook()
const isMobile: Boolean = deviceStore.isMobile
</script>
<style lang="less" scoped>
.author_info {
    max-width: 666px;
    display: flex;
    height: 166px;
    justify-content: space-around;
    margin: 0 auto;
    background-color: #f5f5f5;
    border-radius: 20px;
    box-sizing: border-box;
    padding: 20px;

    .author_avatar_img {
        img {
            width: 66px;
            height: 66px;
            border-radius: 50%;
        }
    }

    .author_info_detail {
        box-sizing: border-box;
        padding: 0px 20px;

        .author_name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .author_desc {
            font-size: 14px;
            color: #999;
        }

        .author_skill {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 500;
        }
    }

    .author_follow {
        display: flex;
        margin-top: 20px;

        .github {
            width: 25px;
            height: 25px;
            margin: 0 20px;
        }

        .juejin {
            width: 25px;
            height: 25px;
        }
    }
}</style>
  