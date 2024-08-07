const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');


module.exports = (passport) => {
    try {
        console.log('passport config');
        passport.use(
            new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
                const user = await User.findOne({ email: email });
                if (!user) {
                    return done(null, false, { message: 'No user with that email' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            })
        );
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser((id, done) => {
            User.findById(id)
                .then((user) => {
                    done(null, user);
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }

    catch (e) {
        console.log('error');
        return done(e);
    }

}