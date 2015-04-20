"use strict";

var _ = require('lodash');
var Joi = require('joi');

function TaskModel(){
  this.schema = {
    taskId: Joi.number().integer(),
    description: Joi.string().max(255)
  };
};

module.exports = TaskModel;
