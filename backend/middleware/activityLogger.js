const ActivityLog = require('../models/ActivityLog');

const activityLogger = async (req, res, next) => {
    // Only log state-changing operations by authenticated users or public submissons
    const actionsToLog = ['POST', 'PUT', 'DELETE'];

    res.on('finish', async () => {
        if (actionsToLog.includes(req.method) && res.statusCode < 400) {
            try {
                await ActivityLog.create({
                    userId: req.user ? req.user.id : null,
                    userName: req.user ? req.user.name : 'Anonymous',
                    action: `${req.method} ${req.originalUrl}`,
                    method: req.method,
                    url: req.originalUrl
                });
            } catch (err) {
                console.error('Log Error:', err);
            }
        }
    });

    next();
};

module.exports = activityLogger;
