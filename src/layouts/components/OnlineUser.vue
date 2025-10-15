<!--------------------------------
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/10/15 08:41
 --------------------------------->
<script setup>
// 定义组件名称（用于 keepAlive，与菜单 code 一致）
defineOptions({ name: 'OnlineUser' })
// 列表数据
const listData = ref([])
// 加载状态
const loading = ref(false)
// 显示状态
const show = ref(false)
// 空状态判定
const showEmpty = computed(() => !loading.value && listData.value.length === 0)
</script>

<template>
  <i class="i-me:online-user mr-16 h-24 w-24 hover:cursor-pointer" @click="show = !show" />
  <n-drawer v-model:show="show" width="50vh" close-on-esc placement="right" resizable>
    <n-drawer-content closable>
      <template #header>
        在线用户
      </template>
      <!-- 加载骨架屏 -->
      <n-skeleton v-if="loading" text :repeat="5" class="mb-8" />
      <!-- 空状态 -->
      <n-empty v-else-if="showEmpty" description="暂无数据" class="py-10" />
      <n-list clickable hoverable>
        <n-list-item>
          <n-thing title="相见恨晚" content-style="margin-top: 10px;">
            <template #description>
              <n-space size="small" style="margin-top: 4px">
                <n-tag :bordered="false" type="info" size="small">
                  暑夜
                </n-tag>
                <n-tag :bordered="false" type="info" size="small">
                  晚春
                </n-tag>
              </n-space>
            </template>
            奋勇呀然后休息呀<br>
            完成你伟大的人生
          </n-thing>
        </n-list-item>
        <n-list-item>
          <n-thing title="他在时间门外" content-style="margin-top: 10px;">
            <template #description>
              <n-space size="small" style="margin-top: 4px">
                <n-tag :bordered="false" type="info" size="small">
                  环形公路
                </n-tag>
                <n-tag :bordered="false" type="info" size="small">
                  潜水艇司机
                </n-tag>
              </n-space>
            </template>
            最新的打印机<br>
            复制着彩色傀儡<br>
            早上好我的罐头先生<br>
            让他带你去被工厂敲击
          </n-thing>
        </n-list-item>
      </n-list>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>
