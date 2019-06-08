<template>
    <div class="loading-container">
    <p>{{statusText}}</p>
    </div>
</template>

<script>
  export default {
    name: 'LoadingWindow',
    data () {
      return {
        statusText: 'Inicializiram ...'
      }
    },
    created () {},
    beforeCreate () {
      this.$electron.ipcRenderer.on('splashMsg', (event, data) => {
        this.statusText = data
        console.log('Main sent; ', data)
      })
    }
  }
</script>

<style scoped>
    body {
        background: none !important;
    }

    .loading-container {
        width: 240px;
        height: 480px;
        max-width: 240px;
        max-height: 480px;
        overflow: hidden;
        background: transparent url('~@/assets/loading-transparent.gif') no-repeat fixed center top;
    }

    p {
        background: white;
        color: #252525;
        font-size: medium;
        font-weight: bold;
        text-transform: uppercase;
        text-decoration: none;
        text-align: center;
        width: 100%;
        margin-top: 366px;
        padding: 20px 10px;
    }
</style>
