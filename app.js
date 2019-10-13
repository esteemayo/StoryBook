const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');


// PASSPORT CONFIG
require('./config/passport')(passport);

// HANDLEBARS HELPERS
const {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
} = require('./helpers/hbs');

// REQUIRING ROUTES
const authRoute = require('./routes/auth');
const indexRoute = require('./routes/index');
const storiesRoute = require('./routes/stories');

const app = express();

// MONGODB CONNECTION
mongoose.connect('mongodb://localhost:27017/storybook', {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));



app.engine('handlebars', exphbs({
    helpers: {
        truncate,
        stripTags,
        formatDate,
        select,
        editIcon
    },
    defaultLayout: 'main'
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'handlebars');

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());

app.use(cookieParser());

app.use(require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// GLOBAL VARIABLES
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});











app.use('/auth', authRoute);
app.use('/', indexRoute);
app.use('/stories', storiesRoute);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`APP LISTENING ON PORT ${PORT}`));