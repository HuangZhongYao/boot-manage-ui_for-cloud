<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/16 18:51:10
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <AppCard class="flex items-center px-12" border-b="1px solid light_border dark:dark_border">
    <MenuCollapse />
    <BreadCrumb />

    <div class="ml-auto flex flex-shrink-0 items-center px-12 text-18">
      <ToggleTheme />
      <Fullscreen />
      <ThemeSetting class="mr-16" />
      <i
        class="i-fe:github mr-16 cursor-pointer"
        @click="handleLinkClick('https://github.com/HuangZhongYao/boot-manage-ui_for-cloud')"
      />
      <i
        class="i-me:gitee mr-16 cursor-pointer"
        @click="handleLinkClick('https://gitee.com/smog_huang/boot-manage-ui_for-cloud')"
      />
      <Notification />
      <OnlineUser />
      <UserAvatar />
      <WebSocketNotification />
    </div>
  </AppCard>
</template>

<script setup>
import { ToggleTheme } from '@/components'
import { BreadCrumb, Fullscreen, MenuCollapse, Notification, OnlineUser, UserAvatar, WebSocketNotification } from '@/layouts/components'

function handleLinkClick(link) {
  window.open(link)
}
</script>
