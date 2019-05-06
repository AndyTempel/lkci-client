<template>
    <el-container direction="vertical">
        <el-main><h3 class="center" style="margin-top: 2rem; margin-bottom: 2rem">{{titleText}}</h3></el-main>
        <el-main v-show="!hideFields" style="max-width: 400px; margin: auto">
            <el-input type="text" placeholder="Uporabniško ime" id="username" ref="username" v-model="username"></el-input>
            <el-input type="password" placeholder="Geslo" id="password" ref="password" v-model="password" style="margin-top: 0.5rem"></el-input>
            <label style="margin-top: 20px">
                Strežnik
                <el-select id="server" v-model="serverBase" @change="checkServerStatus">
                    <el-option selected value="https://lkci.ksoft.si" label="lkci.ksoft.si"></el-option>
                    <el-option value="http://127.0.0.1:5000" label="127.0.0.1:5000"></el-option>
                </el-select>
            </label>
        </el-main>
        <el-main>
            <div class="pulsate" style="text-align: center;" v-show="serverChecking"><p>Poteka preverjanje dosegljivosti
                strežnika ...</p></div>
            <div class="pulsate" style="text-align: center; color: red" v-show="serverFail"><p>Ta strežnik trenutno ni
                dosegljiv. Izberite drug strežnik!</p></div>
            <el-button id="login" v-show="showLoginBtn" @click="processLogin" :disabled="disableLoginBtn">Vpis
            </el-button>
        </el-main>
    </el-container>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'LoginPage',
    data: function () {
      return {
        username: '',
        password: '',
        titleText: 'Prijava:',
        serverBase: 'https://lkci.ksoft.si',
        serverChecking: true,
        serverFail: false,
        showLoginBtn: false,
        disableLoginBtn: false,
        hideFields: false
      }
    },
    methods: {
      checkServerStatus (e) {
        this.$data.serverChecking = true
        this.$data.showLoginBtn = false
        this.$data.serverFail = false
        const data = this.$data

        axios.get(`${this.$data.serverBase}/api/ping`, {
          timeout: 5000
        }).then(function () {
          data.serverChecking = false
          data.showLoginBtn = true
          data.serverFail = false
        }).catch(function () {
          data.serverChecking = false
          data.showLoginBtn = false
          data.serverFail = true
        })
      },
      processLogin () {
        this.$data.disableLoginBtn = true
        const thisObj = this
        axios.get(`${this.$data.serverBase}/api/token`, {
          auth: {
            username: thisObj.$refs.username.value,
            password: thisObj.$refs.password.value
          },
          timeout: 5000
        }).then(({data}) => {
          localStorage.setItem('token', data.token)
          localStorage.setItem('tokenExp', new Date().getTime() + data.duration * 1000)
          localStorage.setItem('username', thisObj.$refs.username.value)
          localStorage.setItem('password', thisObj.$refs.password.value)
          thisObj.showLoginBtn = false
          thisObj.titleText = 'Dokončevanje prijave ...'
          thisObj.hideFields = true
          thisObj.finishLogin()
        }).catch(function (reason) {
          alert('Prijava ni uspešna! Poizkusite ponovno.')
          thisObj.$data.disableLoginBtn = false
        })
      },
      finishLogin () {
        const thisObj = this
        axios.get(`${this.serverBase}/api/init`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }).then(({data}) => {
          localStorage.setItem('profile', JSON.stringify(data))
          thisObj.$router.push('/home')
        }).catch((err) => {
          alert('Prišlo je do napake pri pridobivanjem podatkov.\n' + err)
          window.location.reload()
        })
      }
    },
    created () {
      this.checkServerStatus(null)
    }
  }
</script>

<style scoped>
    @import "~@/assets/css/fonts.css";
    @import "~normalize.css/normalize.css";


    .center {
        text-align: center;
    }

    el-input, select, label {
        max-width: 300px !important;
        margin: 7px auto;
        display: block;
    }

    button {
        margin: auto;
        display: block;
    }

    .pulsate {
        -webkit-animation: pulsate 1.5s ease;
        -webkit-animation-iteration-count: infinite;
        opacity: 0.5;
    }

    @-webkit-keyframes pulsate {
        0% {
            opacity: 0.5;
        }
        50% {
            opacity: 1.0;
        }
        100% {
            opacity: 0.5;
        }
    }
</style>
