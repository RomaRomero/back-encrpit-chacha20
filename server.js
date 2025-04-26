const express = require('express');
const cors = require('cors'); // <--- ¡Esta línea es necesaria!
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

const app = express();

app.use(cors()); // <-- Ahora sí funciona correctamente

connectDB();


app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
