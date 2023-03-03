module.exports = (req, res, next) => {
    if (!req.session.isloggedin) {
        return res.json({
            status: 'fail',
            message:'you must login'
        })
    }
    next();
}