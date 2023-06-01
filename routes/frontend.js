
// current path: /
const router = require("express").Router();

const { userAuthOptional } = require('../middleware/auth');
const path = require('path');

const sendFrontendPage = (res, page) => {
    res.cookie("currentPage", page, { maxAge: 86400 });
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

router.get('/:filename', (req, res) => {
    if (!req.cookies.currentPage) {
        return res.redirect('/');
    }
    const fileName = req.params.filename;
    res.sendFile(path.resolve(`public/${req.cookies.currentPage}/${fileName}`));
});

router.get('/global/:filename', (req, res) => {    
    const fileName = req.params.filename;
    res.sendFile(path.resolve(`public/${fileName}`));
});

router.get('/global/:subfolder/:filename', (req, res) => {
    const { subfolder, filename } = req.params;
    res.sendFile(path.resolve(`public/${subfolder}/${filename}`));
});

module.exports = router;