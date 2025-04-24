const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const librarianRoutes = require('./routes/librarianRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/librarian', librarianRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
