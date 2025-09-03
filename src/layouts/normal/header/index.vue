<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/16 18:52:48
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <AppCard class="flex items-center px-12" border-b="1px solid light_border dark:dark_border">
    <MenuCollapse />
    <AppTab class="w-0 flex-1 px-12" />
    <span class="mx-6 opacity-20">|</span>
    <div class="flex flex-shrink-0 items-center px-12 text-18">
      <ToggleTheme />
      <Fullscreen />
      <i
        class="i-fe:github mr-16 cursor-pointer"
        @click="handleLinkClick('https://github.com/HuangZhongYao/boot-manage-ui')"
      />
      <i
        class="i-me:gitee mr-16 cursor-pointer"
        @click="handleLinkClick('https://gitee.com/smog_huang/boot-manage-ui')"
      />
      <ThemeSetting class="mr-16" />
      <n-badge class="mr-16" size="small" value="12" :max="99" processing @click="showMyNotice = !showMyNotice">
        <i class="i-fe:bell hover:cursor-pointer" />
      </n-badge>
      <UserAvatar class="mr-16" />
      <n-drawer v-model:show="showMyNotice" :max-width="1000" width="80vh" close-on-esc placement="right" resizable>
        <n-drawer-content title="消息通知" closable>
          <MyNotice />
        </n-drawer-content>
      </n-drawer>
    </div>
  </AppCard>
</template>

<script setup>
import { ToggleTheme } from '@/components'
import { AppTab, Fullscreen, MenuCollapse, UserAvatar } from '@/layouts/components'
import MyNotice from '@/views/notice/my-notice/index.vue'

const showMyNotice = ref(false)

function handleLinkClick(link) {
  window.open(link)
}
</script>
