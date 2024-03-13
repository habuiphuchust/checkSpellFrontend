<template>
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
        v-loading.fullscreen.lock="fullscreenLoading" class="demo-ruleForm" :label-position="labelPosition">
        <el-form-item label="Nhập URL:" prop="url">
            <el-input v-model="ruleForm.url" placeholder="Please input url" />
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Check</el-button>
        </el-form-item>
    </el-form>
    <RecentSearch :setUrl="setNewUrl"></RecentSearch>
    <el-dialog v-model="dialogVisible" title="Tips" width="500">
        <span v-html="text"></span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
    <!-- <CheckView ref="dialogView"></CheckView> -->
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FormProps } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import RecentSearch from '../components/recent-search/RecentSearch.vue'
// import CheckView from '../components/recent-search/CheckView.vue'



const store = useUserStore()


const ruleFormRef = ref<FormInstance>()
const text = ref('')
const setNewUrl = (t) => {
    ruleForm.url = t
}
const dialogVisible = ref(false)
const fullscreenLoading = ref(false)



const checkUsername = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input url'))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    url: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    url: [{ validator: checkUsername, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
            sendRequestCheck();
        } else {
            console.log('error submit!')
            return false
        }
    })
}

const labelPosition = ref<FormProps['labelPosition']>('top')


const sendRequestCheck = async () => {
    let url = { url: ruleForm.url }
    console.log(url)
    fullscreenLoading.value = true;
    try {
        const response = await fetch('http://localhost:8080/api/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + store.token
            },
            body: JSON.stringify(url)
        })
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            const result = JSON.parse(data.data.repair)
            fullscreenLoading.value = false
            emphasizeMistake(result.spellchecker.result.spellingCheckResponse.misspellings, data.data.text)

        } else {
            console.error('Error 1:', response.statusText)
            ElMessage('Có lỗi xảy ra 1')
            fullscreenLoading.value = false


        }

    } catch (error) {
        console.error('Error: 2', error);
        ElMessage('Có lỗi xảy ra 2')
        fullscreenLoading.value = false


    }

}

const emphasizeMistake = (mistake, origin) => {
    const mlength = mistake?.length;
    const remainder = [];
    if (!mlength || typeof origin !== 'string') {
        text.value = origin;
        dialogVisible.value = true;
        return;
    };
    console.log(mistake);
    for (let i = 1; i < mlength; i++) {
        let start = mistake[i - 1].charStart + mistake[i - 1].charLength
        let length = mistake[i].charStart - start;
        remainder.push({ start, length })
    }
    if (mistake[0].charStart != 0) remainder.unshift({ start: 0, length: mistake[0].charStart })
    console.log(remainder)

    let coloredText = '';
    if (remainder[0].start === 0) {
        for (let i = 0; i < mlength; i++) {
            coloredText += origin.substr(remainder[i].start, remainder[i].length);
            coloredText += `<span class='tooltip'>${origin.substr(mistake[i].charStart, mistake[i].charLength)}<span class='tooltiptext' id='mistake-position-${i}'></span></span>`;
        }
    } else {
        for (let i = 0; i < mlength - 1; i++) {
            coloredText += `<span class='tooltip'>${origin.substr(mistake[i].charStart, mistake[i].charLength)}<span class='tooltiptext' id='mistake-position-${i}'></span></span>`;
            coloredText += origin.substr(remainder[i].start, remainder[i].length);
        }
    }
    coloredText += origin.substr(mistake[mlength - 1].charStart + mistake[mlength - 1].charLength)
    text.value = coloredText
    dialogVisible.value = true;
    for (let i = 0; i < mlength; i++) {
        setTimeout(() => {
            let e = document.getElementById(`mistake-position-${i}`);
            let suges = ''
            mistake[i].suggestions.forEach(element => {
                suges += element.suggestion + ' / '
            });
            e.innerText = suges
        }, 500)

    }
}

</script>

<style>
.error-text {
    background-color: yellow;
}

.tooltip {
    position: relative;
    display: inline-block;
    background-color: yellow;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    margin-left: -60px;
}

.tooltip:hover .tooltiptext {
    visibility: visible;
}
</style>