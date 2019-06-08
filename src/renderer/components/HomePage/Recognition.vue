<template>
    <el-container v-loading="contLoading">
        <el-header><h3>Prepoznava</h3></el-header>
        <el-main v-show="showUpload">
            <el-upload drag action="" :http-request="uploadFile" ref="fileUpload"
                       :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">Spustite datoteko sem ali <em>kliknite za prenos</em></div>
                <div class="el-upload__tip" slot="tip">jpg/png datoteke z velikostjo manj kot 20mb</div>
            </el-upload>
        </el-main>
        <el-main v-show="showResult">
            <el-button type="danger" @click="resetFiles" round>Nova prepoznava</el-button>
            <el-divider></el-divider>
            <el-tabs tab-position="left">
                <el-tab-pane label="Rezultat">
                    <h4>Rezultat</h4>
                    <el-image :src="imgResult" fit="scale-down"></el-image>
                </el-tab-pane>
                <el-tab-pane label="Celice">
                    <div class="cell-container">
                        <div v-for="crop in crops" :key="crop.id" class="cell-box">
                            <span style="display: block">{{crop.cellName}}</span>
                            <el-image :src="crop.image" fit="scale-down" v-loading="crop.isLoading" style="overflow: hidden; max-height: 132px"></el-image>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="Sivina">
                    <h4>Sivina</h4>
                    <el-image :src="imgGray" fit="scale-down"></el-image>
                </el-tab-pane>
                <el-tab-pane label="HSV">
                    <h4>HSV Spekter</h4>
                    <el-image :src="imgHSV" fit="scale-down"></el-image>
                </el-tab-pane>
                <el-tab-pane label="Maska">
                    <h4>Maska Zaznave</h4>
                    <el-image :src="imgMask" fit="scale-down"></el-image>
                </el-tab-pane>
            </el-tabs>
        </el-main>
    </el-container>
</template>

<script>
  import { ConcurrencyManager } from 'axios-concurrency'
  import axios from 'axios'

  let serverBase = localStorage.getItem('serverBase')
  export default {
    name: 'Recognition',
    data () {
      return {
        showUpload: true,
        showResult: false,
        contLoading: false,
        imgResult: '',
        imgGray: '',
        imgHSV: '',
        imgMask: '',
        crops: [],
        recognitionQueue: []
      }
    },
    methods: {
      getToken () {
        if (localStorage.getItem('tokenExp') > new Date().getTime()) {
          return localStorage.getItem('token')
        } else {
          console.warn('Token expired, requesting new one ...')
          axios.get(`${serverBase}/api/token`, {
            timeout: 5000,
            auth: {
              username: localStorage.getItem('username'),
              password: localStorage.getItem('password')
            }
          }).then(({data}) => {
            localStorage.setItem('token', data.token)
            localStorage.setItem('tokenExp', new Date().getTime() + data.duration * 1000)
            return data.token
          }).catch(reason => {
            console.error('Token could not be refreshed!', reason)
            localStorage.clear()
            alert('Žetona ni bilo mogoče osvežiti avtomatsko, prosimo prijavite se ponovno!')
            this.$router.push('/login')
          })
        }
      },
      resetFiles () {
        this.showResult = false
        this.imgResult = this.imgHSV = this.imgGray = this.imgMask = ''
        this.$refs.fileUpload.clearFiles()
        this.showUpload = true
      },
      uploadFile (file, fileList) {
        const thisObj = this
        this.contLoading = true
        let formData = new FormData()
        formData.append('file', file.file)
        axios.post(`${serverBase}/api/detect`,
          formData,
          {
            headers: {
              authorization: `Bearer ${thisObj.getToken()}`,
              'Content-Type': 'multipart/form-data'
            }
          }).then(({data}) => {
          if (data.error) {
            alert(data.errMessage)
            thisObj.contLoading = false
            thisObj.$refs.fileUpload.clearFiles()
            return
          }
          console.log('Success:', data)
          thisObj.imgResult = `data:image/jpeg;base64,${data.files.result}`
          thisObj.imgGray = `data:image/jpeg;base64,${data.files.gray}`
          thisObj.imgMask = `data:image/jpeg;base64,${data.files.mask}`
          thisObj.imgHSV = `data:image/jpeg;base64,${data.files.hsv}`
          thisObj.crops = data.crops.map(function (o) {
            let _o = Object.assign({}, o)
            _o.isLoading = true
            _o.cellName = 'Prepoznavam ...'
            return _o
          })
          console.log(thisObj.crops)
          thisObj.showUpload = false
          thisObj.showResult = true
          thisObj.contLoading = false
          thisObj.processRecognition()
        }).catch(reason => {
          console.error('Failed to get recognition image!', reason)
          alert('Prišlo je do napake: ' + reason)
          thisObj.contLoading = false
          thisObj.$refs.fileUpload.clearFiles()
        })
      },
      processRecognition () {
        const thisObj = this
        let api = axios.create({
          baseURL: serverBase,
          headers: {
            authorization: `Bearer ${thisObj.getToken()}`
          }
        })
        const manager = ConcurrencyManager(api, 1)
        Promise.all(thisObj.crops.map(obj => api.post(`/api/recognise`, {'image': obj.image}).then(({data}) => {
          obj.isLoading = false
          obj.cellName = data.cell.name
        }).catch(reason => {
          obj.isLoading = false
          obj.cellName = 'NAPAKA!!!'
          console.error(reason)
        })))
        manager.detach()
      }
    },
    created () {
      serverBase = localStorage.getItem('serverBase')
    }
  }
</script>

<style scoped>
    .cell-container {
        display: flex;
        flex-wrap: wrap;
    }

    .cell-box {
        width: 150px;
        height: 150px;
        padding: 10px;
    }
</style>
