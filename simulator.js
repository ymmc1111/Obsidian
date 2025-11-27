#!/usr/bin/env node

const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');

const machines = ['CNC-01', 'CNC-02', 'MILL-01', 'LATHE-01'];

client.on('connect', () => {
    console.log('🔗 Connected to MQTT broker');
    console.log('📡 Simulating factory telemetry...\n');

    setInterval(() => {
        machines.forEach((machineId) => {
            const telemetry = {
                metrics: {
                    temperature: 180 + Math.random() * 40,
                    vibration: 0.5 + Math.random() * 2,
                    spindle_speed: 3000 + Math.random() * 1000,
                    power_consumption: 15 + Math.random() * 10,
                },
                unit: 'mixed',
                metadata: {
                    location: 'Shop Floor A',
                    operator: 'SYS-AUTO',
                },
            };

            const topic = `factory/${machineId}/telemetry`;
            client.publish(topic, JSON.stringify(telemetry));

            console.log(`📊 ${machineId}: Temp=${telemetry.metrics.temperature.toFixed(1)}°C, Vibration=${telemetry.metrics.vibration.toFixed(2)}mm/s`);
        });
    }, 2000);
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
    process.exit(1);
});
