const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        notificationId: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

