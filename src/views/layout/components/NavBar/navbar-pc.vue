<template>
    <div>
       <div class="navbar_pc">
            <div class="navbar_pc_left">
                <div class="navbar_pc_left_img" @click="router.push('/')"><img src="../../../../static/images/avatar.jpeg" alt=""></div>
                <div class="navbar_pc_left_one" @click="router.push('/')">
                     Home
                </div>
                <div class="navbar_pc_left_one" @click="router.push('/about')">
                     About
                </div>
                <div class="navbar_pc_left_one" @click="router.push('/author')">
                     Author
                </div>
            </div>
            <div class="navbar_pc_right"></div>
       </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<style lang="less" scoped>
.navbar_pc{
    max-width: 1140px;
    height: 144px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;;
    .navbar_pc_left{
        display: flex;
        align-items: center;
        .navbar_pc_left_img{
            img{
                width: 44px;
                height: 44px;
                display: block;
            }
        }
        .navbar_pc_left_one{
            font-weight: 500;
            font-size: 18px;
            color: #000;
            margin-left: 30px;
            cursor: pointer;
        }
    }
}
</style>