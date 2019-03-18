<template>

    <scan-view v-if="activePage == 'scan'" 
        @goBack="goToRoot" 
        @deviceAdded="onDeviceAdded" 
    />
    <device-view v-else-if="activePage == 'device'" 
        :device="activeDevice" 
        @goBack="goToRoot" 
    />
    <home-view v-else 
        :connectedDevices="connectedDevices"
        @goToScan="goToScan"
        @goToDevice="goToDevice" 
    />
    
</template>

<script lang="ts">
import ScanView from './ScanView.vue'
import HomeView from './HomeView.vue'
import DeviceView from './DeviceView.vue'

export default {
    components: {
        ScanView,
        HomeView,
        DeviceView
    },
    data() {
      return {
        activePage: '',
        activeDeviceUUID: null,
        connectedDevices: [
        ],
      }
    },
    computed: {
        activeDevice() {
            return this.connectedDevices.find(d => d.UUID = this.activeDeviceUUID)
        }
    },
    methods: {
        goToRoot() {
            this.activePage = ''
        },
        goToScan() {
            this.activePage = 'scan'
        },
        goToDevice(uuid: string) {
            this.activePage = 'device'
            this.activeDeviceUUID = uuid
        },
        onDeviceAdded(device) {
            this.connectedDevices.push(device)
        }
    }    
  }
</script>

<style scoped>
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }
</style>
