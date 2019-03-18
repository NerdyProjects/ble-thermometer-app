<template>
    <Page>
        <ActionBar :title="device.name || 'Unnamed Device'">
            <NavigationButton text="Go Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <TabView>
            <TabViewItem title="Readings">
                <StackLayout>
                    <Label :text="currentTemperature" v-if="currentTemperature" />
                </StackLayout>
            </TabViewItem>
            <TabViewItem title="Settings">
                <Label text="blabla" />
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script lang="ts">
  import { registerLiveTemperatureUpdate, unregisterLiveTemperatureUpdate } from "../bluetooth"
  export default {
    data() {
        return {
            'currentTemperature': null
        }
    },
    props: {
        device: Object
    },
    methods: {
        goBack() {
            this.$emit('goBack')
        },
        temperatureUpdate(t) {
            this.currentTemperature = t
        }
    },
    created() {
        registerLiveTemperatureUpdate(this.temperatureUpdate)
    },
    destroyed() {
        unregisterLiveTemperatureUpdate()
    }
  }
</script>

<style scoped>
    /* ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    } */
</style>
