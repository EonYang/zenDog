import express from 'express';
import config from '../config';

const mongojs = require('mongojs');
const db = mongojs(config.username + ':' + config.passsword + "@ds043350.mlab.com:43350/testdata01");
const router = express.Router();

router.get('/top10', (req, res) =>
{
  db.top10.find({}, (err, data) => {
    if (err || !data) {
      console.log('date didn\'t find');
    } else {
      res.send(data);
    };
  });
});

export default router;
