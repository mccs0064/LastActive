const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.deviceId) {
        return res.status(400).send({
            message: "User required First Name, Last Name, Email, DeviceId"
        });
    }

    // Create a User
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        deviceId: req.body.deviceId,

    });

    // Save User in the database
    user.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        });
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
        .then(users => {
            res.send(users);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving users."
            });
        });
};

// Find a single user with a userId
exports.findOneById = (req, res) => {

    User.findById(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            res.send(user);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with id " + req.params.userId
            });
        });
};

// // Find a single user with an email
// exports.findOneByEmail = (req, res) => {
//     console.log(req.params.email)

//     User.findOne(req.params.email)
//     .then(user => {
//         if(!user) {
//             return res.status(404).send({
//                 message: "User not found with email " + req.params.email
//             });            
//         }
//         res.send(user);
//     }).catch(err => {
//         if(err.kind === 'ObjectId') {
//             return res.status(404).send({
//                 message: "User not found with email " + req.params.email
//             });                
//         }
//         return res.status(500).send({
//             message: "Error retrieving user with email " + req.params.email
//         });
//     });
// };

// Update a user identified by the userId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.email) {
        return res.status(400).send({
            message: "User email can not be empty"
        });
    }

    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.userId, {
        email: req.body.email
    }, { new: true })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            res.send(user);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            return res.status(500).send({
                message: "Error updating user with id " + req.params.userId
            });
        });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            res.send({ message: "User deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            return res.status(500).send({
                message: "Could not delete user with id " + req.params.userId
            });
        });
};

/**********************************************************************************************/
// Register an user with the specified attributes
exports.register = (req, res) => {

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var deviceId = req.body.deviceId;

    // Validation
    req.checkBody('firstName', 'FirstName is required').notEmpty();
    req.checkBody('lastName', 'LastName is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('deviceId', 'Passwords do not match').notEmpty();


    var errors = req.validationErrors();

    if (errors) {
        return res.status(422).send({
            message: "Failed validation for request"
        });
    }
    else {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            deviceId: deviceId
        })

        createUser(newUser, function (err, user) {
            if (err) throw err
            console.log(user)
        })

        res.send({ message: "Done Registring and Creating User" });
    }
};


function createUser(newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

passport.use(new LocalStrategy(
    function (email, password, done) {
        console.log("got inside local strategy in method")

        getUserByEmail(email, function (err, user) {
            console.log("getting user by email log in method")

            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            console.log("about to compare passwords log in method")

            comparePassword(password, user.password, function (err, isMatch) {
                console.log("inside comparing passwords log in method")

                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    getUserById(id, function (err, user) {
        done(err, user);
    });
});

exports.login = (req, res) => {
    console.log("im inside login")
    return passport.authenticate('local',
         (req, res) => {
            console.log("im in login pt2")
            res.send({ message: "Done logging user in" })
        }
    )(req,res)}

exports.logout = (req, res) => {

    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.send({ message: "Done Loging out user" });

}

// router.post('/login',
// 	passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
// 	function (req, res) {
// 		res.redirect('/');
// 	});

// router.get('/logout', function (req, res) {
// 	req.logout();
// 	req.flash('success_msg', 'You are logged out');
// 	res.redirect('/users/login');
// });

function getUserByEmail(username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

function getUserById(id, callback) {
    User.findById(id, callback);
}

function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

