const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'],
            default: 'Driver',
            required: true,
            index: true,
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'light',
            },
            notifications: {
                licenseAlerts: { type: Boolean, default: true },
                maintenanceAlerts: { type: Boolean, default: true },
                tripAlerts: { type: Boolean, default: true },
            },
            units: {
                type: String,
                enum: ['metric', 'imperial'],
                default: 'metric',
            },
            dateFormat: {
                type: String,
                default: 'DD/MM/YYYY',
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;