const Message = require('../models/Message');

exports.submitMessage = async (req, res) => {
    try {
        const { customerName, customerEmail, message } = req.body;
        const msg = new Message({ customerName, customerEmail, message });
        await msg.save();
        res.status(201).json({ msg: 'Success' });
    } catch (err) {
        res.status(500).json({ error: 'Submit Error' });
    }
};

exports.getAdminMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Admin Error' });
    }
};

exports.getUserMessages = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const messages = await Message.find({ customerEmail: user.email }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error("GET USER MESSAGES ERROR:", err);
        res.status(500).json({ error: String(err) });
    }
};
