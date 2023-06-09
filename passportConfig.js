const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

const init = (passport, getUserByEmail, getUserById) => {
    // Authentifier l'utilisateur
    
    const authenticateUser = async (email, password, done) => {
        
        const user = getUserByEmail(email)

        if (user == null) {
            return done(null, false, {
                message: "No user found"
            })
        }
        try {
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "Incorrect Password"
                })
            }
        } catch (error) {
            console.log(error);
            return done(error)
        }

    }


    passport.use(new LocalStrategy({usernameField: "email"}, authenticateUser))

    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })

}

module.exports = init;