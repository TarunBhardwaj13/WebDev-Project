const express = require('express');
const router = express.Router();
const {
  addResource,
  fetchResources,
  deleteResource
} = require('./resourceController');

// Add (POST) & Fetch (GET)
router.route('/')
  .post(addResource)
  .get(fetchResources);

// Delete (DELETE by ID)
router.route('/:id')
  .delete(deleteResource);

module.exports = router;