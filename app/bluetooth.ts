import bluetooth from "nativescript-bluetooth"


let isInitialized = false
let connectedPeripheral = null
let recorderService = null
let recorderControl = null
let recorderData = null
let recorderStatus = null
let liveService = null
let liveTemp = null

const liveServiceUUID = "0eed818d-b4b3-6e04-3957-ce096884ca85"
const liveTempCharUUID = "44c46fa8-d6aa-b1fd-c346-226a0af3f383"
const liveBattIdleCharUUID = "74bc5e06-a403-8540-ccf2-e27c6ee66c16"
const liveBattLoadCharUUID = "67c050a2-7424-f86d-ee22-9379a238c375"

const recorderServiceUUID = "8965c8d0-b543-9695-6414-789670ac1cf7"
const recorderControlCharUUID = "8e921d16-a929-4c0c-41ed-8e40fa37013f"
const recorderDataCharUUID = "8c817150-dfc8-f45d-7d8e-e8a539c4a101"
const recorderStatusCharUUID = "dfc54332-8dda-7f88-2699-630483c2fd99"

async function init(): Promise<boolean> {
    if(isInitialized) {
        return true
    }
    const enabled = await bluetooth.enable()
    if(enabled) {
        isInitialized = true
    }
    return enabled
}

export async function scan() {
    let results:bluetooth.Peripheral[] = []
    await init()
    await bluetooth.startScanning({
        serviceUUIDs: [],
        seconds: 5,
        onDiscovered: (peripheral) => {
            results.push(peripheral)
        },
        skipPermissionCheck: false
    })
    return results
}

function handleDisconnect(peripheral) {
    if(!connectedPeripheral) {
        return
    }
    if(peripheral.UUID == connectedPeripheral.UUID) {
        connectedPeripheral = null
    }
}


function connectWrapper(uuid: string , onDisconnected: (peripheral) => any): Promise<bluetooth.Peripheral> {
    return new Promise( (resolve, reject) => {
        bluetooth.connect({
            'UUID': uuid,
            onConnected: resolve,
            onDisconnected: onDisconnected
        })
    })
}

export async function registerLiveTemperatureUpdate(callback) {
    if(!connectedPeripheral) {
        throw new Error('not connected')
    }
    console.log('trying to register notification...')
    await bluetooth.startNotifying({
        peripheralUUID: connectedPeripheral.UUID,
        serviceUUID: liveServiceUUID,
        characteristicUUID: liveTempCharUUID,
        onNotify: (result) => {
            const t = new Int16Array(result.value)
            callback(t[0]/100)
        }
    })
    console.log('activated temperature notification')
}

export async function unregisterLiveTemperatureUpdate() {
    if(!connectedPeripheral) {
        throw new Error('not connected')
    }
    
    await bluetooth.stopNotifying({
        peripheralUUID: connectedPeripheral.UUID,
        serviceUUID: liveServiceUUID,
        characteristicUUID: liveTempCharUUID,
    })
}

export async function connect(uuid) {
    const peripheral = await connectWrapper(uuid, handleDisconnect)

    console.log('found peripheral', peripheral)
    const recorderService = peripheral.services.find(s => s.UUID === recorderServiceUUID)
    if(recorderService === undefined) {
        throw new Error('device does not have recorderService');
    }
    if(recorderService.characteristics.find(c => c.UUID === recorderControlCharUUID) === undefined) {
        throw new Error('missing recorder control characteristic')
    }
    if (recorderService.characteristics.find(c => c.UUID === recorderDataCharUUID) === undefined) {
        throw new Error('missing recorder data characteristic')
    }
    if (recorderService.characteristics.find(c => c.UUID === recorderStatusCharUUID) === undefined) {
        throw new Error('missing recorder status characteristic')
    }
    console.log('discovering live service')

    const liveService = peripheral.services.find(s => s.UUID === liveServiceUUID)
    if(liveService === undefined) {
        throw new Error('device does not have live service')
    }
    if(liveService.characteristics.find(c => c.UUID === liveTempCharUUID) === undefined) {
        throw new Error('missing live temperature characteristic')
    }
    if(liveService.characteristics.find(c => c.UUID === liveBattIdleCharUUID) === undefined) {
        throw new Error('missing live battery idle voltage characteristic')
    }
    if(liveService.characteristics.find(c => c.UUID === liveBattLoadCharUUID) === undefined) {
        throw new Error('missing live battery load voltage characteristic')
    }

    connectedPeripheral = peripheral
}