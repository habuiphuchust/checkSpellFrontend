<template>
  <el-button @click="() => { sortBy = 'time', sortDir === 'asc' ? sortDir = 'des' : sortDir = 'asc' }">sort by
    date</el-button>
  <el-button @click="() => { sortBy = 'time', sortDir === 'asc' ? sortDir = 'des' : sortDir = 'asc' }">sort by
    url</el-button>
  <el-table :data="filterTableData" style="width: 100%" v-loading.fullscreen.lock="fullscreenLoading">
    <el-table-column label="Date" prop="time" sortable />
    <el-table-column label="Link" prop="url" sortable />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search" />
      </template>

      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">Check</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination :page-size="pageSize" :pager-count="7" layout="prev, pager, next" :total="totalElement"
    @current-change="val => getPage(val - 1, pageSize, sortBy, sortDir, search)" />
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useUserStore } from '@/stores/user'


const store = useUserStore()

const recentSearch = ref([]);
const pageSize = ref(10);
const currentPage = ref(0);
const totalElement = ref(100);
const sortBy = ref('time');
const sortDir = ref('asc');
const fullscreenLoading = ref(false)

const props = defineProps(['setUrl'])





interface Url {
  time: string
  url: string
}

const search = ref('')

const filterTableData = computed(() =>
  recentSearch.value
)
const handleEdit = (index: number, row: Url) => {
  console.log(index, row)
  console.log(props.setUrl(row.url))
  props.setUrl(row.url)
}
const handleDelete = (index: number, row: Url) => {
  console.log(index, row)
  ElMessageBox.confirm(
    'proxy will permanently delete the file. Continue?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      deleteUrl(row.url)

    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
}


onMounted(() => getPage(0, pageSize.value));

const getPage = async (page = 0, size = 10, sortBy = "time", sortDir = "asc", keyword = "") => {
  try {
    fullscreenLoading.value = true;
    const response = await fetch(`http://localhost:8080/api/url?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}&keyword=${keyword}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.token
      }
    })
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      pageSize.value = data.data.pageSize;
      totalElement.value = data.data.totalElement
      currentPage.value = data.data.currentPage

      recentSearch.value = data.data.urls
      fullscreenLoading.value = false

      // setTimeout(() => {
      //   pageSize.value = data.data.pageSize;
      //   totalElement.value = data.data.totalElement
      //   currentPage.value = data.data.currentPage

      //   recentSearch.value = data.data.urls
      //   fullscreenLoading.value = false
      // }, 200)

    } else {
      console.error('Error 1:', response.statusText)
      fullscreenLoading.value = false

    }

  } catch (error) {
    console.error('Error: 2', error);
    fullscreenLoading.value = false

  }
};

const deleteUrl = async (url) => {
  console.log(url)
  fullscreenLoading.value = true;
  try {
    const response = await fetch('http://localhost:8080/api/url', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + store.token
      },
      body: JSON.stringify({ url })
    })
    if (response.ok) {
      const data = await response.json();
      console.log(data)
      ElMessage({
        type: 'success',
        message: 'Delete completed',
      })
      getPage(currentPage.value, pageSize.value, sortBy.value, sortDir.value, search.value)

    } else {
      console.error('Error 1:', response.statusText)
      ElMessage('Có lỗi xảy ra')
      fullscreenLoading.value = false


    }

  } catch (error) {
    console.error('Error: 2', error);
    ElMessage('Có lỗi xảy ra')
    fullscreenLoading.value = false


  }

}

watch([search, sortBy, sortDir], ([newSearch, newSortBy, newSortDir]) => {
  getPage(currentPage.value, pageSize.value, newSortBy, newSortDir, newSearch)
})
</script>
