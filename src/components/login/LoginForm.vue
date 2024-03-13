<template>
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules" label-width="auto"
        class="demo-ruleForm" :label-position="labelPosition">
        <el-form-item label="Username" prop="username">
            <el-input v-model="ruleForm.username" placeholder="Please input username" />
        </el-form-item>
        <el-form-item label="Password" prop="pass">
            <el-input v-model="ruleForm.pass" type="password" placeholder="Please input password" show-password />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Login</el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FormProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter} from 'vue-router'


import { useUserStore } from '@/stores/user'

const store = useUserStore()
const router = useRouter()


const ruleFormRef = ref<FormInstance>()

const checkUsername = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the username'))
    } else {
        callback()
    }
}

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    pass: '',
    username: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    pass: [{ validator: validatePass, trigger: 'blur' }],
    username: [{ validator: checkUsername, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
            sendRequestLogin();
        } else {
            console.log('error submit!')
            return false
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}
const labelPosition = ref<FormProps['labelPosition']>('top')

const sendRequestLogin = async () => {
    let user = {username: ruleForm.username, password: ruleForm.pass}
    console.log(user)
    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            if (data?.message === 'success' && data.data != null)
                setUserInfo(data.data)
                router.push('/homepage')

        } else {
            console.error('Error 1:', response.statusText)
            ElMessage('Sai tên đăng nhập hoặc mật khẩu')
        }
        
    } catch (error) {
        console.error('Error: 2', error);
        ElMessage('Có lỗi xảy ra')
    }

}
const setUserInfo = (data) => {
    let token = data.token;
    let fullName = data.fullName;
    let username = data.username;

    store.setToken(token);
    store.setFullName(fullName);
    store.setUsername(username);
    store.setIsLogin(true);


}

</script>