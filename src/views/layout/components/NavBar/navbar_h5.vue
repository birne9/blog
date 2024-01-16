<template>
    <div>
       <div class="navbar_h5">
            <div class="navbar_h5_left">
                <div class="navbar_h5_left_img" @click="router.push('/')"><img src="../../../../static/images/avatar.jpeg" alt=""></div>
            </div>
            <div class="navbar_h5_right">

            </div>
       </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
<style lang="less" scoped>
.navbar_h5{
    width: 100vw;
    height: 90px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;;
    .navbar_h5_left{
        margin-left: 20px;
        .navbar_h5_left_img{
            img{
                width: 44px;
                height: 44px;
                display: block;
            }
        }
        .navbar_h5_left_one{
            font-weight: 500;
            font-size: 18px;
            color: #000;
            margin-left: 30px;
            cursor: pointer;
        }
    }
}
</style>