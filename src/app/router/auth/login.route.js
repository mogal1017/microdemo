const express = require('express');
const router = express.Router();
const auth = require('../../controller/auth/login/login.controller');

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: "This is login api page!"
    });
});

router.post('/signUp', auth.signUp);
router.post('/login', auth.login);
module.exports = router;