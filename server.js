const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(flash());
app.use('/uploads/books', express.static(path.join(__dirname, 'public/uploads/books')));
app.use('/uploads', express.static('uploads'));


app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());


app.use(express.static(path.join(__dirname, 'public')));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const initialRoutes = require('./routes/initial');
const librarianRoutes = require('./routes/librarianRoutes');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/', initialRoutes);
app.use('/librarian', librarianRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
