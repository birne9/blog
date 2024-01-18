<template>
    <div class="author_h5">
        <div class="author_h5_info">
            <div class="author_h5_avatar_img">
                <img src="../../static/images/wx_avatar.jpg" alt="avatar" title="birne9" />
            </div>
            <div class="author_h5_info_detail">
                <div class="author_h5_name">
                    birne9 <div class="author_h5_follow">
                        <div class="github">
                            <a href="https://github.com/birne9" target="_self" title="birne9">
                                <img src="../../static/svg/github.svg">
                            </a>
                        </div>
                        <div class="juejin">
                            <a href="https://juejin.cn/user/3281406576841406" alt="birne9" title="birne9" target="_self">
                                <img src="../../static/svg/juejin.svg">
                            </a>
                        </div>
                    </div>
                </div>
                <div class="author_h5_desc"> A Front-End Developer</div>
                <div class="author_h5_skill">Skill：Vue、React、Node、H5、Hybrid App...</div>
            </div>

        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
.author_h5_info {
    display: flex;
    margin: 0 auto;
    background-color: #f5f5f5;
    border-radius: 20px;
    box-sizing: border-box;
    padding: 20px;
    width: calc(100vw - 40px);

    .author_h5_avatar_img {
        width: 66px;
        height: 66px;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }

    .author_h5_info_detail {
        box-sizing: border-box;
        // padding: 0px 20px;
        width: calc(100vw - 166px);
        margin-left: 20px;

        .author_h5_name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            // logo
            .author_h5_follow {
                display: flex;

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
        }

        .author_h5_desc {
            font-size: 14px;
            color: #999;
        }

        .author_h5_skill {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 500;
        }
    }

}</style>
  