const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const port = process.env.PORT || 3000;
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const app = express();


//set up view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//Passport Config
require('./config/passport')(passport);

//Routes
const indexRouter = require('./routes/indexRouter');
const communityRouter = require('./routes/communityRouter');
const adoptionRouter = require('./routes/adoptionRouter');
const userRouter = require('./routes/userRouter');
const settingRouter = require('./routes/settingRouter');
const adminRouter = require('./routes/adminRouter');

//Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb',extended: false }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

//MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// pasport middleware
app.use(passport.initialize());
app.use(passport.session());


// flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
});


app.use('/', indexRouter);
app.use('/community', communityRouter);
app.use('/adoption', adoptionRouter);
app.use('/user', userRouter);
app.use('/setting', settingRouter);
app.use('/admin', adminRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));