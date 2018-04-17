const express = require('express');
const path = require('path');
const exphbs= require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')

//Load Routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')

const app = express();

//Passport Config
require('./config/passport')(passport);

//Session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash middleware
app.use(flash());

//Method override middleware
app.use(methodOverride('_method'));

//Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev')
    .then(()=> console.log('MongoDb connected'))
    .catch(err => console.log(err));

//Handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Global Variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//Use routes
app.use('/ideas', ideas)
app.use('/users', users)

//Index Route
app.get('/', (req, res)=>{
    const title = 'Welcome'
    res.render('index', {
        title: title
    })
})

app.get('/about', (req, res)=>{
    res.render('about')
})

const port = 8080;

app.listen(8080, ()=> {
    console.log(`server started on port${port}`)
})