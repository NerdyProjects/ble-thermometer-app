<template>
    <Page>
        <ActionBar title="Add a Device...">
            <NavigationButton text="Go Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <StackLayout v-if="isLoading">
            <ActivityIndicator :busy="true" />
        </StackLayout>
        <StackLayout v-if="!isLoading">
            <Button  text="Rescan" @tap="startScan" />
            <ListView for="item in devices" @itemTap="connectToDevice">
                <v-template>
                    <GridLayout columns="*, *" rows="30">
                        <Label :text="item.name || 'Null'" android:textStyle="bold" row="0" col="0" />
                        <Label :text="item.UUID" row="0" col="1" />
                    </GridLayout>
                </v-template>
            </ListView>
            <Label v-if="!devices.length" text="no devices found so far. please retry" />
        </StackLayout>
    </Page>
</template>

<script lang="ts">
  import { Peripheral } from "nativescript-bluetooth"
  import { scan as bluetoothScan, connect as bluetoothConnect } from "../bluetooth"

  export default {
    data() {
      return {
        devices: [],
        isLoading: false
      }
    },
    created() {
        this.startScan()
    },
    methods: {
        async startScan() {
            if(this.isLoading) {
                // disable rescan while it is already scanning
                return
            }
            this.isLoading = true
            try {
                this.devices = await bluetoothScan()
            } catch(err) {
                console.error(err)
                alert(err.message)
            } finally {
                this.isLoading = false
            }
        },
        async connectToDevice(event) {
            const item: Peripheral = event.item
            console.log(item)
            try {
                await bluetoothConnect(item.UUID)
                this.$emit('deviceAdded', {name: item.name, UUID: item.UUID})
            } catch(err) {
                console.error(err)
            }
            
        },
        goBack() {
            this.$emit('goBack')
        }
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
