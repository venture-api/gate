const {Router} = require('express');
const resources = require('./resources');
const factory = require('./factory');
const status = require('./status');
const auth = require('./auth');
const mockOAuth = require('./mockOAuth');


const router = Router({});

router.use('/resources', resources);
router.use('/factories', factory);
router.use('/status', status);
router.use('/auth', auth);
router.use('/mockOAuth', mockOAuth);

module.exports = router;
