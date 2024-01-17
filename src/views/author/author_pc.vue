<template>
    <div class="author_pc">
        <div class="author_pc_info">
            <div class="author_pc_avatar_img">
                <img src="../../static/images/wx_avatar.jpg" alt="avatar" title="birne9" />
            </div>
            <div class="author_pc_info_detail">
                <div class="author_pc_name">
                    birne9
                </div>
                <div class="author_pc_desc"> A Front-End Developer</div>
                <div class="author_pc_skill">Skill：Vue、React、Node、H5、Hybrid App...</div>
            </div>
            <div class="author_pc_follow">
                <div class="github">
                    <a href="https://github.com/birne9" target="_blank" title="birne9">
                        <img src="../../static/svg/github.svg" >
                    </a>
                </div>
                <div class="juejin">
                    <a href="https://juejin.cn/user/3281406576841406" alt="birne9" title="birne9" target="_blank">
                        <img src="../../static/svg/juejin.svg"  >
                    </a>
                    
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
.author_pc_info {
    max-width: 666px;
    display: flex;
    height: 166px;
    justify-content: space-around;
    margin: 0 auto;
    background-color: #f5f5f5;
    border-radius: 20px;
    box-sizing: border-box;
    padding: 20px;

    .author_pc_avatar_img {
        img {
            width: 66px;
            height: 66px;
            border-radius: 50%;
        }
    }

    .author_pc_info_detail {
        box-sizing: border-box;
        padding: 0px 20px;

        .author_pc_name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .author_pc_desc {
            font-size: 14px;
            color: #999;
        }
        .author_pc_skill{
            margin-top: 10px;
            font-size: 14px;
            font-weight: 500;
        }
    }
    .author_pc_follow{
        display: flex;
        margin-top: 20px;
        .github{
           width: 25px;
           height: 25px;
           margin: 0 20px;
        }
        .juejin{
            width: 25px;
            height: 25px;
        }
    }
}</style>
  