<!--------------------------------
 - @Author: zuuuYao
 - @LastEditor: zuuuYao
 - @LastEditTime: 2025/10/15 08:41
 --------------------------------->
<script setup>
import api from '@/views/pms/user/api.js'
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

function getOnlineUser() {
  show.value = !show.value
  loading.value = true
  api.queryOnlineUser().then((res) => {
    listData.value = res.result
  }).finally(() => {
    loading.value = false
  })
}
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <i class="i-me:online-user mr-16 h-20 w-20 hover:cursor-pointer" @click="getOnlineUser" />
    </template>
    在线用户
  </n-tooltip>

  <n-drawer v-model:show="show" width="50vh" close-on-esc placement="right" resizable>
    <n-drawer-content closable>
      <template #header>
        在线用户
      </template>
      <!-- 加载骨架屏 -->
      <n-skeleton v-if="loading" text :repeat="5" class="mb-8" />
      <!-- 空状态 -->
      <n-empty v-else-if="showEmpty" description="暂无数据" class="py-10" />
      <n-list hoverable>
        <n-list-item v-for="item in listData" :key="item.id">
          <n-thing :title="item.username" content-style="margin-top: 10px;">
            <template #avatar>
              <n-avatar round size="large" :src="item.avatarUrl" />
            </template>
            <template #description>
              <n-space size="small" style="margin-top: 4px">
                <n-tag :bordered="false" type="info" size="small">
                  {{ item.account }}
                </n-tag>
                <n-tag :bordered="false" type="info" size="small">
                  {{ item.phone }}
                </n-tag>
                <n-tag :bordered="false" type="success" size="small">
                  在线
                </n-tag>
              </n-space>
            </template>
            <template #footer>
              最后登录时间：{{ item.lastLoginTime }}
            </template>
          </n-thing>
          <template #suffix>
            <n-button type="error">
              强退
            </n-button>
          </template>
        </n-list-item>
      </n-list>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>

</style>
