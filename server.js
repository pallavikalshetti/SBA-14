const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');

const userRoutes = require('./routes/users');
const bookmarkRoutes = require('./routes/bookmarks');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(passport.initialize());

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB error:', err));

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});