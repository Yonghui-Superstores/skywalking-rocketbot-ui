<template>
  <div class="global-loading" v-show="visible" :style="'top:'+ topHeight ">

    <div class="spinner-icon">
      <LoadingIcon />
    </div>
</div>

</template>
<style lang="scss">
  .global-loading {
    position: fixed;
    top: 100px;
    left: 0;
    right: 0;
    bottom: 0;
    .spinner-icon {
      position: absolute;
      left : calc(50% - 19px);
      top: 100px;
      height: 80px;
    }
  }
</style>

<script >
  import LoadingIcon from './loading-icon.vue'
  export default {
    components: {
      LoadingIcon
    },
    props: ['top', 'visible'],
    computed: {
      topHeight() {
        return (this.top || 100) +'px'
      }
    }


  }
</script>