module.exports = {
    authUser: function (req, res, next) {
        if (req.session.authUser) {
            next();
        } else {
            res.redirect('/login');
        }
    },
    skipRouter: function (req, res, next) {
        if (req.session.authUser) {
            res.redirect('/community');
        } else {
            next();
        }
    }
}
