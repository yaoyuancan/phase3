const express = require('express');
const router = express.Router();
const {ObjectId} = require('mongodb')

const userModel = require('../models/user.model')

router.post('/update-profile', async (req, res) => {
    try {
        const data = req.body
        console.log('data', data)
        // check id
        const user_id = req.body.user_id
        if (!user_id) {
            return res.status(404).json({status: 'error', message: 'user id is required'})
        }
        // check first, last
        // await userModel.updateOne({
        //     _id: new ObjectId(user_id)
        // }, {$set: req.body})
        const findUser = await userModel.findOne({_id: new ObjectId(user_id)})
        if (!findUser) {
            return res.status(404).json({status: 'error', message: 'cannot find the user'})
        }
        findUser.set(req.body)
        await findUser.save()
        res.json({status: 'success', 'message': 'update profile successful'})
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


module.exports = router