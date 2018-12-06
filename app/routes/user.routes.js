module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    // Register a new User
    app.post('/users', users.register);

    // Logs an user in
    app.post('/users/login', users.login);

    // Logs an user out
    app.post('/users/logout', users.logout);

    // Retrieve all Users
    app.get('/users', users.findAll);

    // Retrieve a single User with userId
    app.get('/users/:userId', users.findOneById);

    // Retrieve a single User with email
    // app.get('/usersByEmail/:email', users.findOneByEmail);

    // Update a User with userId
    app.put('/users/:userId', users.update);

    // Delete a User with userId
    app.delete('/users/:userId', users.delete);

}