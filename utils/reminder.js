const cron = require('node-cron');
const db = require('./db'); // your mysql connection
const { sendSms } = require('./utils/sms'); // your SMS helper

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    console.log("📬 Running daily borrow reminders...");

    // Set how many days before return date to send reminder
    const daysBefore = 2;
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + daysBefore);

    const formattedDate = reminderDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all borrow_requests where return_date = reminderDate and status = approved
    const [requests] = await db.execute(
      `SELECT br.resource_code, br.return_date, u.name, u.phone_no, br.id AS borrow_id
       FROM borrow_requests br
       JOIN users u ON br.registration_no = u.reg_no
       WHERE br.status = 'approved' AND DATE(br.return_date) = ?`,
      [formattedDate]
    );

    for (const req of requests) {
      const message = `Reminder: Hello ${req.name}, please return your borrowed resource (${req.resource_code}) by ${req.return_date}.`;
      const smsResult = await sendSms(req.phone_no, message);

      if (!smsResult.success) {
        console.warn(`⚠️ Reminder SMS failed for ${req.phone_no}:`, smsResult.error);
      } else {
        console.log(`✅ Reminder SMS sent to ${req.phone_no} for ${req.resource_code}`);
      }
    }

  } catch (err) {
    console.error('Error sending daily reminders:', err);
  }
});
