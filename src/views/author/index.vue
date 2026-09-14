<template>
    <div class="author container">
        <div class="author_card">
            <div class="author_avatar">
                <img src="../../static/images/wx_avatar.jpg" alt="avatar" title="birne9" />
            </div>
            <div class="author_detail">
                <div class="author_name">
                    birne9
                    <div class="author_follow author_follow_inline">
                        <a href="https://github.com/birne9" target="_blank" rel="noopener noreferrer" title="birne9">
                            <img src="../../static/svg/github.svg" alt="GitHub" />
                        </a>
                        <a href="https://juejin.cn/user/3281406576841406" target="_blank" rel="noopener noreferrer" title="birne9">
                            <img src="../../static/svg/juejin.svg" alt="掘金" />
                        </a>
                    </div>
                </div>
                <div class="author_desc">A Front-End Developer</div>
                <div class="author_skill">Skill：Vue、React、Node、H5、Hybrid App...</div>
            </div>
            <div class="author_follow author_follow_side">
                <a href="https://github.com/birne9" target="_blank" rel="noopener noreferrer" title="birne9">
                    <img src="../../static/svg/github.svg" alt="GitHub" />
                </a>
                <a href="https://juejin.cn/user/3281406576841406" target="_blank" rel="noopener noreferrer" title="birne9">
                    <img src="../../static/svg/juejin.svg" alt="掘金" />
                </a>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
/* 移动优先: 头像 + 信息卡片, 社交图标内联在名字行 */
.author {
    padding-top: 20px;
    padding-bottom: 40px;

    .author_card {
        display: flex;
        background-color: #f5f5f5;
        border-radius: 20px;
        box-sizing: border-box;
        padding: 20px;
        width: 100%;
    }

    .author_avatar {
        flex-shrink: 0;
        width: 66px;
        height: 66px;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: block;
        }
    }

    .author_detail {
        box-sizing: border-box;
        margin-left: 20px;
        min-width: 0;

        .author_name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .author_desc {
            font-size: 14px;
            color: #999;
        }

        .author_skill {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 500;
            color: #000;
        }
    }

    .author_follow {
        display: flex;
        align-items: center;

        a {
            display: flex;
            width: 25px;
            height: 25px;

            img {
                width: 25px;
                height: 25px;
                display: block;
            }

            + a {
                margin-left: 20px;
            }
        }
    }

    /* 移动端: 图标内联在名字行右侧; 桌面端: 独立显示在卡片右侧 */
    .author_follow_inline {
        flex-shrink: 0;
    }

    .author_follow_side {
        display: none;
    }
}

@media (min-width: 768px) {
    .author {
        padding-top: 40px;

        .author_card {
            max-width: 666px;
            margin: 0 auto;
            height: 166px;
            align-items: center;
            justify-content: space-around;
            padding: 20px;
        }

        .author_detail {
            padding: 0 20px;

            .author_name {
                margin-bottom: 5px;
            }
        }

        .author_follow_inline {
            display: none;
        }

        .author_follow_side {
            display: flex;
            margin-top: 20px;
            align-self: flex-start;

            a + a {
                margin-left: 20px;
            }
        }
    }
}
</style>
