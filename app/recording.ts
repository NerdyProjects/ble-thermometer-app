class RecordEntry {
    const META_MASK = 0x8000
    const INVALID_VAL = 0x8000
    const STOP_MEASUREMENT_VAL = 0x8002
    const START_MEASUREMENT_VAL = 0x8003
    const MEASUREMENT_INTERVAL_VAL = 0x9000
    const MEASUREMENT_INTERVAL_MASK = 0xF000
    const MEASUREMENT_INTERVAL_VALUE_MASK = 0x0FFF
    const TIME_ELAPSED_MASK = 0xC000
    const TIME_ELAPSED_VAL = 0xC000
    const TIME_ELAPSED_VALUE_MASK = 0x3FFF

    temperature: number = undefined
    empty: boolean = false
    stop_measurement: boolean = false
    start_measurement: boolean = false
    measurement_interval: number = undefined
    time_elapsed: number = undefined
    skip: boolean = false /* this record is an extension part of a previous record and keeps no meaning after being parsed */

    constructor(data: number, previous_record: RecordEntry) {
        if((data & this.META_MASK) == 0) {
            this.temperature = data
            if(this.temperature & 0x4000) {
                /* negative temperatures are still in twoth complement format, but uppermost bit is lost. Manually add and sign extend */
                this.temperature = this.temperature | 0xFFFF8000
            }
        } else if(data == this.INVALID_VAL) {
            this.empty = true
        } else if(data == this.STOP_MEASUREMENT_VAL) {
            this.stop_measurement = true
        } else if(data == this.START_MEASUREMENT_VAL) {
            this.start_measurement = true
        } else if((data & this.MEASUREMENT_INTERVAL_MASK) == this.MEASUREMENT_INTERVAL_VAL) {
            this.measurement_interval = data & this.MEASUREMENT_INTERVAL_VALUE_MASK
        } else if((data & this.TIME_ELAPSED_MASK) == this.TIME_ELAPSED_VAL) {
            if (previous_record && previous_record.time_elapsed != undefined) {
                /* when previous record is also a time elapsed record, they belong together forming a wider number, where the first entry i
                the LSB part. Update previous record and skip this one. */
                previous_record.time_elapsed += (data & this.TIME_ELAPSED_VALUE_MASK) * (this.TIME_ELAPSED_VALUE_MASK + 1)
                this.skip = true
            } else {
                this.time_elapsed = data & this.TIME_ELAPSED_VALUE_MASK
            }
        }
    }
}

class AppFlags {
    connected: boolean
    set_directed_connectable: boolean
    set_public_connectable: boolean
    connectable: boolean
    pairable: boolean
    read_recorder_buffer: boolean
    tx_buffer_full: boolean
    confirmation_received: boolean
    start_gap_security_request: boolean
    hci_encryption_change_event_flag: boolean
    trigger_data_transfer: boolean
    aci_gap_pairing_complete_event_flag: boolean
    adc_load_conversion_in_progress: boolean
    adc_idle_conversion_in_progress: boolean
    adc_load_conversion_request: boolean
    adc_idle_conversion_request: boolean
    sensor_unavailable: boolean
    sensor_timer_elapsed: boolean
    sensor_measurement_triggered: boolean
    measurement_enabled: boolean
    request_low_power_connection_parameters: boolean
    request_disable_ble: boolean
    request_disable_measurement: boolean
    request_enable_measurement: boolean
    request_ring_clear: boolean
    recording_enabled: boolean
    store_record_time_difference: boolean
    allow_connect_after_disconnect: boolean

    constructor(data: ArrayBuffer) {
        const view = new DataView(data, 0, 4)
        const flags = view.getUint32(0, true)
        this.connected = !!(flags & 1)
        /* ToDo: Implement */

    }
}

/*
aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 0, 4, &app_flags);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 4, 2, &ring_used_space);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 6, 2, &max_connection_time_s);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 8, 2, &max_connectable_time_s);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 10, 2, &sensor_update_rate_s);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 12, 4, &last_temperature_update_s);
  aci_gatt_update_char_value(recorderServHandle, recorderStatusCharHandle, 16, 4, &git_hash);
  */
class RecorderStatus {
    flags: AppFlags
    buffer_used: number
    max_connection_time: number
    max_connectable_time: number
    sensor_update_rate: number
    latest_recording_age: number
    software_revision: string

    constructor(data: ArrayBuffer) {
        const view = new DataView(data, 0, 20)
        this.flags = new AppFlags(data.slice(0, 4))
        this.buffer_used = view.getUint16(4, true)
        this.max_connection_time = view.getUint16(6, true)
        this.max_connectable_time = view.getUint16(8, true)
        this.sensor_update_rate = view.getUint16(10, true)
        this.latest_recording_age = view.getUint32(12, true)
        this.software_revision = (view.getUint32(16, true)).toString(16)
    }
}

class Recording {
    unresolved_points: Array<RecordEntry>

    constructor() {

    }

    add_points(points: Uint16Array) {
        let last_entry = this.unresolved_points.length ? this.unresolved_points[this.unresolved_points.length - 1] : undefined
        points.forEach(point => {
            const entry = new RecordEntry(point, last_entry)
            unresolved_points.push(entry)
            last_entry = entry
        });
    }
}
