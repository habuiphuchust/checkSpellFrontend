<template>
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules" label-width="auto"
        class="demo-ruleForm" :label-position="labelPosition">
        <el-form-item label="Username" prop="username">
            <el-input v-model="ruleForm.username" />
        </el-form-item>
        <el-form-item label="Tên của bạn" prop="fullName">
            <el-input v-model="ruleForm.fullName" />
        </el-form-item>
        <el-form-item label="Password" prop="pass">
            <el-input v-model="ruleForm.pass" type="password" placeholder="Please input password" show-password />
        </el-form-item>
        <el-form-item label="Confirm" prop="checkPass">
            <el-input v-model="ruleForm.checkPass" type="password" placeholder="Please input password again" show-password />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Submit</el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FormProps } from 'element-plus'
import { ElMessage } from 'element-plus'



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
const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password again'))
    } else if (value !== ruleForm.pass) {
        callback(new Error("Two inputs don't match!"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    pass: '',
    checkPass: '',
    username: '',
    fullName: ''
})

const rules = reactive<FormRules<typeof ruleForm>>({
    pass: [{ validator: validatePass, trigger: 'blur' }],
    checkPass: [{ validator: validatePass2, trigger: 'blur' }],
    username: [{ validator: checkUsername, trigger: 'blur' }],
    fullName: [{ validator: checkUsername, trigger: 'blur' }]
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
            sendRequestSignup();
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

const sendRequestSignup = async () => {
    let user = {username: ruleForm.username, password: ruleForm.pass, fullName: ruleForm.fullName}
    console.log(user)
    try {
        const response = await fetch('http://localhost:8080/api/register', {
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
                ElMessage(data.data)


        } else {
            console.error('Error 1:')
            const err = await response.json();
            ElMessage(err.message)
        }
        
    } catch (error) {
        console.error('Error: 2', error);
        ElMessage('Có lỗi xảy ra')
    }

}

</script>