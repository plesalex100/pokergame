const router = require("express").Router();

const { userAuthOptional } = require('../middleware/auth');
const path = require('path');

const sendFrontendPage = (res, page) => {
    res.cookie("currentPage", page, { expires: new Date(Date.now() + 86400) });
    res.sendFile(path.resolve(`public/${page}/index.html`));
}

router.get('/', userAuthOptional, (req, res) => {

    if (!req.user) {
        return res.redirect('/login');
    }
    
    sendFrontendPage(res, "lobby");
});

router.get('/login', userAuthOptional, (req, res) => {

    if (req.user) {
        return res.redirect('/');
    }

    sendFrontendPage(res, "login");
});

router.get('/:filepath', (req, res) => {
    if (!req.cookies.currentPage) {
        return res.redirect('/');
    }
    const filePath = req.params.filepath;
    res.sendFile(path.resolve(`public/${req.cookies.currentPage}/${filePath}`));
});

router.get('/global/:filepath', (req, res) => {    
    const filePath = req.params.filepath;
    res.sendFile(path.resolve(`public/${filePath}`));
});

module.exports = router;