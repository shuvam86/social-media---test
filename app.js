// Load modules
const express = require('express');
const exphbs = require('express-handlebars');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
// Connect to MongoURI exported from external file
const keys = require('./config/keys');
const stripe= require('stripe')(keys.StripeSecretKey);

const User= require('./models/user');  //we collected user information in this variable
const Post= require('./models/post');
const methodOverride= require('method-override');






require('./passport/google-passport');


const {
    ensureAuthentication
} = require('./helpers/auth');


// initialize application
const app = express();
// Express config
 app.use(cookieParser());
 app.use(bodyParser.urlencoded({
     extended: false
 }));
 app.use(bodyParser.json());
 app.use(session({
     secret: 'keyboard cat',
     resave: true,
     saveUninitialized: true,
     cookie: { secure: false }
 }));

 app.use(methodOverride('_method'));

 app.use(passport.initialize());
 app.use(passport.session());

app.use((req,res,next) => {               //user is set as a global variable
    res.locals.user= req.user || null;
    next();
})
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
// setup template engine
app.engine('handlebars', exphbs.engine( {
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.set('view engine', 'handlebars');
// setup static file to serve css, javascript and images
app.use(express.static('public'));

mongoose.Promise= global.Promise;

// connect to remote database
mongoose.connect(keys.MongoURI, {
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to Remote Database....');
}).catch((err) => {
    console.log(err);
});
// set environment variable for port
const port = process.env.PORT || 3000;
// Handle routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});
// GOOGLE AUTH ROUTE
app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile','email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    });


//FB auth route
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: 'email'
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


  app.get('/auth/instagram',
  passport.authenticate('instagram'));

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });





  //handle profile route




app.get('/profile', ensureAuthentication, (req, res) => {
    // User.findById({_id:req.user._id})     //we will find user information through user collection (line no 32(user)) and find specific id ny findById
    // .then((user) => {
    //     res.render('profile', {
    //         user:user
    //     });
    // })

    Post.find({user: req.user._id})
    .populate('user')
    .sort({date: 'desc'})
    .then((posts) => {
        res.render('profile', {
            posts:posts
        });
    });



    // res.render('profile');
});

app.get('/users',ensureAuthentication, (req,res) => {
    User.find({}).then((users) => {       // {} retrieve all users from collection
        res.render('users', {
            users:users                   // we pass users object which contain all users data
        });
    });
});

app.get('/user/:id',ensureAuthentication,(req,res) => {
    User.findById({_id: req.params.id})       //params is used to get parameter and id is used to get id from :id from line 136. We will find id matching from users collection by _id
    .then((user) => {                         //we get a specific user
        res.render('user', {
            user:user
        });
    });
});



app.post('/addPhone', ensureAuthentication,(req,res) => {
    const phone= req.body.phone;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.phone= phone;
        user.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});

app.post('/addLocation',ensureAuthentication,(req,res) => {
    const location= req.body.location;
    User.findById({_id: req.user._id})
    .then((user) => {
        user.location= location;
        user.save()
        .then(() => {
            res.redirect('/profile');
        });
    });
});


app.get('/addPost',ensureAuthentication,(req,res) => {
    // res.render('addPost');
    res.render('payment', {
        StripePublishableKey: keys.StripePublishableKey
    });
});


app.post('/acceptPayment',ensureAuthentication,(req,res) => {
    // console.log(req.body);
    const amount= 500;
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
    })
    .then((customer) => {
        
        stripe.paymentIntents.create({
            amount: 1099,
            currency: 'inr',
            payment_method_types: ['card'],
        })
        .then((charge) => {
            res.render('success', {
                charge:charge
            });
            
        });
    });
});

app.get('/displayPostForm',ensureAuthentication,(req,res) => {
    res.render('addPost');
});


app.post('/savePost', ensureAuthentication,(req,res) => {
    // console.log(req.body);                          //body will hold object. if we type body.title it holds value of title. body.body holds value of body
    var allowComments;
    if(req.body.allowComments) {
        allowComments= true;
    }
    else {
        allowComments= false;
    }
    const newPost= {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user._id
    }
    new Post(newPost).save()
    .then(() => {
        res.redirect('/posts');
    })
});


app.get('/editPost/:id',ensureAuthentication, (req,res) => {
    Post.findOne({_id:req.params.id})
    .then((post) => {
        res.render('editingPost', {
            post:post
        });
    });
});


app.put('/editingPost/:id',ensureAuthentication, (req,res) => {
    Post.findOne({_id: req.params.id})
    .then((post) => {
        var allowComments;
        if(req.body.allowComments) {
            allowComments= true;
        }
        else {
            allowComments= false;
        }  
        post.title= req.body.title;
        post.body= req.body.body;
        post.status= req.body.status;
        post.allowComments= allowComments;
        post.save()
        .then(() => {
            res.redirect('/profile');
});
    
    });
});


app.delete('/:id',ensureAuthentication,(req,res) => {
    Post.remove({_id: req.params.id})
    .then(() => {
        res.redirect('profile');
    });
});


app.get('/posts', ensureAuthentication, (req,res) => {
    Post.find({status: 'public'})
    .populate('user')
    .populate('comments.commentUser')
    .sort({date: 'desc'})
    .then((posts) => {
        res.render('publicPosts', {
            posts:posts
        });
    });
});

app.get('/showposts/:id',ensureAuthentication,(req,res) => {
    Post.find({user: req.params.id, status:'public'})
    .populate('user')
    .sort({date:'desc'})
    .then((posts) => {
        res.render('showUserPosts', {
            posts:posts
        });
    });
});



app.post('/addComment/:id',ensureAuthentication, (req,res) => {
    Post.findOne({_id:req.params.id})
    .then((post) => {
        const newComment= {
            commentBody: req.body.commentBody,
            commentUser: req.user._id
        }
        post.comments.push(newComment)
        post.save()
        .then(() => {
            res.redirect('/posts');
        });
    });
});




app.get('/logout',ensureAuthentication, function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });





  var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
  var server_host = process.env.YOUR_HOST || '0.0.0.0';
  app.listen(server_port, server_host, function() {
      console.log('Listening on port %d', server_port);
  });

// app.listen(port, () => {
    
//     console.log(`Server is running on port ${port}`);
// });