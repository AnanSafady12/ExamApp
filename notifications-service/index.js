import express from 'express';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.post('/notify', (req, res) => {
  const { message, recipient } = req.body;
  console.log(`[Notification Service] Sending message to ${recipient}: ${message}`);
  res.status(200).json({ success: true, info: 'Notification sent successfully.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'notifications-service' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`📨 Notifications Service running on port ${PORT}`);
  console.log(`=========================================`);
});
