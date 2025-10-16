<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/04 22:46:57
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage show-footer>
    <n-space size="large">
      <n-card title="按钮 Button">
        <n-space>
          <n-button>Default</n-button>
          <n-button type="tertiary">
            Tertiary
          </n-button>
          <n-button type="primary">
            Primary
          </n-button>
          <n-button type="info">
            Info
          </n-button>
          <n-button type="success">
            Success
          </n-button>
          <n-button type="warning">
            Warning
          </n-button>
          <n-button type="error">
            Error
          </n-button>
        </n-space>
      </n-card>

      <n-card title="带 Icon 的按钮">
        <n-space>
          <n-button type="info">
            <i class="i-material-symbols:add mr-4 text-18" />
            新增
          </n-button>
          <n-button type="error">
            <i class="i-material-symbols:delete-outline mr-4 text-18" />
            删除
          </n-button>
          <n-button type="warning">
            <i class="i-material-symbols:edit-outline mr-4 text-18" />
            编辑
          </n-button>
          <n-button type="primary">
            <i class="i-majesticons:eye-line mr-4 text-18" />
            查看
          </n-button>
        </n-space>
      </n-card>
    </n-space>

    <n-space size="large" mt-30>
      <n-card min-w-340 title="通知 Notification">
        <n-space>
          <n-button @click="notify('info')">
            信息
          </n-button>
          <n-button @click="notify('success')">
            成功
          </n-button>
          <n-button @click="notify('warning')">
            警告
          </n-button>
          <n-button @click="notify('error')">
            错误
          </n-button>
        </n-space>
      </n-card>

      <n-card min-w-340 title="确认弹窗 Dialog">
        <n-button type="error" @click="handleDelete">
          <i class="i-mi:delete mr-4" />
          删除
        </n-button>
      </n-card>

      <n-card min-w-340 title="消息提醒 Message">
        <n-space>
          <n-button :loading="loading" type="primary" @click="handleLogin">
            <i v-show="!loading" class="i-mdi:login mr-4" />
            登录
          </n-button>
          <n-button type="error" @click="handleMultiMessage">
            多个错误提醒
          </n-button>
        </n-space>
      </n-card>

      <n-card min-w-340 title="头像有 small、medium 和 large 大小，也可以自己设定尺寸。">
        <n-space align="flex-end">
          <NAvatar
            size="small"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
          />
          <NAvatar
            size="medium"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
          />
          <NAvatar
            size="large"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
          />
          <NAvatar
            :size="48"
            src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
          />
        </n-space>
      </n-card>

      <n-card min-w-340 title="折叠面板">
        <n-collapse>
          <n-collapse-item title="青铜" name="1">
            <div>可以</div>
          </n-collapse-item>
          <n-collapse-item title="白银" name="2">
            <div>很好</div>
          </n-collapse-item>
          <n-collapse-item title="黄金" name="3">
            <div>真棒</div>
          </n-collapse-item>
        </n-collapse>
      </n-card>

      <n-card min-w-540 title="水印">
        <n-watermark
          content="核心机密"
          cross
          selectable
          :font-size="16"
          :line-height="16"
          :width="192"
          :height="128"
          :x-offset="12"
          :y-offset="28"
          :rotate="-15"
        >
          <n-table :bordered="false" :single-line="false">
            <thead>
              <tr>
                <th>复盘</th>
                <th>赋能</th>
                <th>协同</th>
                <th>...</th>
                <th>串联</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>拉通</td>
                <td>打通</td>
                <td>树立</td>
                <td>...</td>
                <td>履约</td>
              </tr>
              <tr>
                <td>...</td>
                <td>...</td>
                <td>...</td>
                <td>...</td>
                <td>...</td>
              </tr>
            </tbody>
          </n-table>
        </n-watermark>
      </n-card>

      <n-card min-w-440 title="穿梭框 Transfer">
        <n-transfer
          v-model:value="value"
          :options="options"
          :render-target-label="renderLabel"
        />
      </n-card>
    </n-space>

    <n-space size="large" mt-30>
      <n-card min-w-440 title="骨架屏 Skeleton">
        <n-space vertical>
          <n-skeleton height="40px" width="33%" />
          <n-skeleton height="40px" width="66%" :sharp="false" />
          <n-skeleton height="40px" round />
          <n-skeleton height="40px" circle />
        </n-space>
      </n-card>

      <n-card max-w-290 title="跑马灯 Marquee">
        <n-marquee>
          谁用运气换呼吸 谁用灵魂换稻米 谁用运气换呼吸 谁用灵魂换稻米
        </n-marquee>
      </n-card>

      <n-card min-w-340 title="文本省略 Ellipsis">
        点击缩略文本展开完整文本的功能。
        <template #footer>
          <n-ellipsis expand-trigger="click" line-clamp="2" :tooltip="false">
            电灯熄灭 物换星移 泥牛入海<br>
            黑暗好像 一颗巨石 按在胸口<br>
            独脚大盗 百万富翁 摸爬滚打<br>
            黑暗好像 一颗巨石 按在胸口
          </n-ellipsis>
        </template>
      </n-card>

      <n-card max-w-440 title="轮播图 Carousel">
        <n-carousel autoplay dot-type="dot" show-dots>
          <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg"
          >
          <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"
          >
          <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
          >
          <img
            class="carousel-img"
            src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
          >
        </n-carousel>
      </n-card>
    </n-space>

    <n-space size="large" mt-30>
      <n-card
        min-w-340 title="分割线 Divider"
      >
        啊
        <n-divider title-placement="left">
          左
        </n-divider>
        啊
        <n-divider title-placement="right">
          右
        </n-divider>
        啊
        <n-divider dashed>
          虚线
        </n-divider>
        啊
      </n-card>

      <n-card min-w-340 title="动态标签 Dynamic Tags">
        <n-dynamic-tags v-model:value="tags" />
      </n-card>

      <n-card min-w-340 title="时间线 Timeline">
        <n-timeline>
          <n-timeline-item content="啊" />
          <n-timeline-item
            type="success"
            title="成功"
            content="哪里成功"
            time="2018-04-03 20:46"
          />
          <n-timeline-item type="error" content="哪里错误" time="2018-04-03 20:46" />
          <n-timeline-item
            type="warning"
            title="警告"
            content="哪里警告"
            time="2018-04-03 20:46"
          />
          <n-timeline-item
            type="info"
            title="信息"
            content="是的"
            time="2018-04-03 20:46"
            line-type="dashed"
          />
          <n-timeline-item content="啊" />
        </n-timeline>
      </n-card>
    </n-space>

    <n-space size="large" mt-30>
      <n-card min-w-740 title="热力图 Heatmap">
        <n-scrollbar x-scrollable style="max-width: 100%">
          <n-heatmap
            :data="yearData"
            :loading-data="yearData"
            :first-day-of-week="firstDayOfWeek"
            :loading="loadingh"
            :size="size"
            :show-week-labels="showWeekLabels"
            :show-month-labels="showMonthLabels"
            :show-color-indicator="showColorIndicator"
            :fill-calendar-leading="value === 'recent'"
          />
        </n-scrollbar>
      </n-card>
    </n-space>
  </CommonPage>
</template>

<script setup>
import { NAvatar, heatmapMockData } from 'naive-ui'
import { h, ref } from 'vue'
import { sleep } from '@/utils'

const handleDelete = function () {
  $dialog.confirm({
    content: '确认删除？',
    confirm() {
      $message.success('删除成功')
    },
    cancel() {
      $message.warning('已取消')
    },
  })
}

const loading = ref(false)
async function handleLogin() {
  loading.value = true
  $message.loading('登录中...', { key: 'login' })
  await sleep(2000)
  $message.error('登录失败', { key: 'login' })
  await sleep(500)
  $message.loading('正在尝试重新登录...', { key: 'login' })
  await sleep(2000)
  $message.success('登录成功', { key: 'login' })
  loading.value = false
}

function handleMultiMessage() {
  $message.error(['用户名不能为空！', '密码不能为空！', '密码必须大于6位！'])
}

function notify(type) {
  $notification[type]({
    content: '说点啥呢',
    meta: '想不出来',
    duration: 2500,
    keepAliveOnHover: true,
  })
}

const options = [
  {
    label: '07akioni',
    value: 'https://avatars.githubusercontent.com/u/18677354?s=60&v=4',
  },
  {
    label: 'amadeus711',
    value: 'https://avatars.githubusercontent.com/u/46394163?s=60&v=4',
  },
  {
    label: 'Talljack',
    value: 'https://avatars.githubusercontent.com/u/34439652?s=60&v=4',
  },
  {
    label: 'JiwenBai',
    value: 'https://avatars.githubusercontent.com/u/43430022?s=60&v=4',
  },
  {
    label: 'songjianet',
    value: 'https://avatars.githubusercontent.com/u/19239641?s=60&v=4',
  },
]

const renderLabel = function ({ option }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        margin: '6px 0',
      },
    },
    {
      default: () => [
        h(NAvatar, {
          round: true,
          src: option.value,
          size: 'small',
          fallbackSrc: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
        }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginLeft: '6px',
              alignSelf: 'center',
            },
          },
          { default: () => option.label },
        ),
      ],
    },
  )
}

const value = ref([options[0].value])

const tags = ref(['教师', '程序员'])

const yearData = computed(() => {
  return heatmapMockData('recent')
})
const showWeekLabels = ref(true)
const showMonthLabels = ref(true)
const showColorIndicator = ref(true)
const loadingh = ref(false)
const firstDayOfWeek = ref(0)
const size = ref('medium')
</script>

<style scoped>
.carousel-img {
  height: 240px;
  object-fit: cover;
}
</style>
