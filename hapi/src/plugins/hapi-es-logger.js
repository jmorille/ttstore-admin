'use strict';

var Logger = require('glib').Logger;
var logger = new Logger('ElasticSearch');
var util = require('util');

/**
 * Overrides the ElasticSearch logger
 * @type {number}
 */

var ERROR = 0, WARN = 1, INFO = 2, DEBUG = 3, TRACE = 4;

function ESLogger() {
  this.logLevel = WARN;
}

ESLogger.prototype.error = function (message) {
  if (this.logLevel >= ERROR) {
    logger.error(message);
  }
};

ESLogger.prototype.warning = function (message) {
  if (this.logLevel >= WARN) {
    logger.warn(message);
  }
};

ESLogger.prototype.info = function (message) {
  if (this.logLevel >= INFO) {
    logger.info(message);
  }
};

ESLogger.prototype.debug = function (message) {
  if (this.logLevel >= DEBUG) {
    logger.debug(message);
  }
};

ESLogger.prototype.close = function () {
};

ESLogger.prototype.trace = function (httpMethod, requestUrl, requestBody, responseBody, responseStatus) {
  if (this.logLevel >= TRACE) {
    logger.trace(util.format('%s %s//%s:%d%s -> %d', httpMethod, requestUrl.protocol, requestUrl.hostname, requestUrl.port, requestUrl.path, responseStatus));
    if (requestBody) {
      logger.trace(util.format(' > %s', requestBody));
    }
    if (responseBody) {
      logger.trace(util.format(' < %s', responseBody));
    }
  }
};

module.exports = ESLogger;
