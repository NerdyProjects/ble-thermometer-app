<template>
    <Page>
        <ActionBar title="BLE Thermometer">
            <ActionItem 
                @tap="goToScan"
                android.systemIcon="ic_menu_search"
                android.position="actionBar"
            />
        </ActionBar>
        <StackLayout>
            <ListView v-if="connectedDevices" for="item in connectedDevices" @itemTap="openDevice">
                <v-template>
                    <GridLayout columns="*, *" rows="30">
                        <Label :text="item.name || 'Null'" android:textStyle="bold" row="0" col="0" />
                        <Label :text="item.UUID" row="0" col="1" />
                    </GridLayout>
                </v-template>
            </ListView>
            <Label v-if="connectedDevices && !connectedDevices.length" text="no devices added so far" />
        </StackLayout>
    </Page>
</template>

<script lang="ts">
  import { Peripheral } from "nativescript-bluetooth"
  import { scan as bluetoothScan } from "../bluetooth"

  export default {
    props: {
        connectedDevices: Array
    },
    methods: {
        openDevice(event) {
            const item: Peripheral = event.item
            this.$emit('goToDevice', item.UUID)
        },
        goToScan() {
            this.$emit('goToScan')
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
