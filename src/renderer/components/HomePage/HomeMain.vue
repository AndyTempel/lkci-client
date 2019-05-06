<template>
    <el-container>
        <h3>Prijavljeni kot: {{profile.fullName}}</h3>
    </el-container>
</template>

<script>
  export default {
    name: 'HomeMain',
    data () {
      return {
        profile: JSON.parse(localStorage.getItem('profile'))
      }
    }
  }
</script>

<style scoped>

</style>
