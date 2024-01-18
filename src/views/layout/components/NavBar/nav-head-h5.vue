<template>
    <div :class="['nav_head_h5', props.toggleBtn ? 'scale-in-tl' : '']">
        <div class="nav_head_h5_one">
            <div class="nav_head_h5_boxs">
                <div class="nav_head_h5_one" @click="skipPage('/')">Home</div>
                <div class="nav_head_h5_one" @click="skipPage('/about')">About</div>
                <div class="nav_head_h5_one" @click="skipPage('/author')">Author</div>
            </div>
        </div>
        <div class="nav_head_h5_desc">
            🌈 We are who we choose to be.
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
    toggleBtn: {
        type: Boolean,
        default: false,
    }
})
const emit = defineEmits(['changToggle'])
const skipPage = (path: any) => {
    emit('changToggle', false)
    router.push(path)
}
</script>
<style lang="less" scoped>
@import '@/styles/nav-head-h5.css';

.nav_head_h5 {
    position: fixed;
    width: 100vw;
    top: 90px;
    height: calc(100vh - 90px);
    background-color: #fff;
    border-top: 1px solid #f5f5f5;

    .nav_head_h5_one {

        display: flex;
        justify-content: center;
        overflow: hidden;

        .nav_head_h5_boxs {
            margin-top: 150px;
            overflow: hidden;

            .nav_head_h5_one {
                margin-top: 10px;
                font-size: 26px;
                font-weight: 600;

            }
        }
    }
    .nav_head_h5_desc{
        background-color:  #fc7e0f;
        width: 90vw;
        margin: 0 auto;
        margin-top: calc(100vh - 500px);
        color: #fff;
        font-size: 18px;
        border-radius: 30px;
        text-align: center;
        box-sizing: border-box;
        padding: 10px 20px;
    }




}
</style>
  