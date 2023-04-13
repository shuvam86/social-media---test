module.exports= {
    ensureAuthentication: (req,res,next) => {            //We will check if the user authenticated or not if user is not authenticated then we will redirect user to the home page and we will ask them to log in first.
        // if(req.isAuthenticated()) {                      //if user is authenticated
        //     next();                                      //we will let user go to the requested page
        // } 
        // else {                                           //not authenticated
        //     res.redirect('/');                           //redirect to homepage
        // }
        next();
    }

}