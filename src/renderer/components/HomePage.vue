<template>
    <div class="container">
        <el-container>
            <el-aside width="220px" style="height: 100%">
                <el-menu default-active="2"
                         class="el-menu"
                         router>
                    <el-submenu index="1">
                        <template slot="title">
                            <i class="el-icon-user-solid"></i>
                            <span>{{profile.fullName}}</span>
                        </template>
                        <el-menu-item-group title="">
                            <el-menu-item index="" @click="logout">Odjava</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                    <el-menu-item index="/home/main" active>
                        <i class="el-icon-s-home"></i>
                        <span><b>Domov</b></span>
                    </el-menu-item>
                    <el-menu-item index="/home/recognition">
                        <i class="el-icon-magic-stick"></i>
                        <span><b>Prepoznaj WBC</b></span>
                    </el-menu-item>
                    <el-menu-item index="/home/counting">
                        <i class="el-icon-collection"></i>
                        <span><b>Štetje</b></span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  import electron from 'electron'

  const eleRemote = electron.remote
  const currentFrame = electron.remote.getCurrentWindow()

  export default {
    name: 'HomePage',
    data () {
      return {
        profile: JSON.parse(localStorage.getItem('profile'))
      }
    },
    methods: {
      logout () {
        let choice = eleRemote.dialog.showMessageBox(currentFrame, {
          type: 'question',
          buttons: ['Odjavi se!', 'Prekliči'],
          title: 'Potrditev odjave',
          message: 'Ali ste prepričani, da se želite odjaviti? To bo zbrisalo vse trenutne podatke.'
        })
        if (choice === 0) {
          localStorage.clear()
          eleRemote.app.relaunch()
          eleRemote.app.exit(0)
        }
      }
    },
    created () {
      currentFrame.setResizable(true)
      currentFrame.setSize(1000, 750, true)
      currentFrame.center()
      currentFrame.setMinimumSize(1000, 750)
      this.$router.push('/home/main')
    }
  }
</script>

<style scoped>
@import "~@/assets/css/home.css";
</style>
