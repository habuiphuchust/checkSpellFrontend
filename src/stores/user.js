import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref("")
  const username = ref("")
  const fullName = ref("")
  const isLogin = ref(false)


  function setToken(newToken) {
    if (typeof newToken === "string") 
        token.value = newToken
  }

  function setUsername(newUsername) {
    if (typeof newUsername === "string")
        username.value = newUsername
  }

  function setFullName(newFullName) {
    if (typeof newFullName === "string")
        fullName.value = newFullName
  }

  function setIsLogin(newIsLogin) {
    if (typeof newIsLogin === "boolean")
        isLogin.value = newIsLogin
  }

  return { token, username, fullName, isLogin,
setFullName, setToken, setUsername, setIsLogin }
})
