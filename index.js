'use strict';

const VError = require('verror');

function unravelCustomStack(error, callback) {
  let errorFullStack;

  if (error instanceof CustomVError) {
    errorFullStack = error.stack;
    error.stack = error._originalStack;
  }

  callback();

  if (errorFullStack) {
    error.stack = errorFullStack;
  }
}

function unravelCustomStacks(error, callback) {
  let cause = VError.cause(error);

  if (!cause) {
    callback();
    return;
  }

  unravelCustomStack(cause, () => {
    unravelCustomStacks(cause, callback);
  });
}

class CustomVError extends VError {
  constructor() {
    super(...arguments);

    this._originalStack = this.stack;

    unravelCustomStacks(this, () => {
      this.stack = VError.fullStack(this);
    });
  }

  get cause() {
    return VError.cause(this);
  }
}

function findCauseByType(err, Error) {
  let cause = err;

  do {
    cause = VError.cause(cause);
  } while (cause && !(cause instanceof Error));

  return cause;
}

function findLastCauseByType(err, Error) {
  let lastCause;
  let cause = err;

  do {
    lastCause = cause;
    cause = findCauseByType(lastCause, Error);
  } while (cause);

  return lastCause;
}

CustomVError.findLastErrorByType = findLastCauseByType;

function buildCombinedError(remaining, child, callback) {
  let parent = remaining.pop();

  if (!parent) {
    callback(child);
    return;
  }

  let combinedError = new VError(child, parent.message);

  combinedError.stack = parent.stack;

  unravelCustomStack(child, () => {
    buildCombinedError(remaining, combinedError, callback);
  });
}

class CustomMultiError extends VError.MultiError {
  constructor() {
    super(...arguments);

    let errors = this.errors().slice();
    let child = errors.pop();

    buildCombinedError(errors, child, combinedError => {
      this.message = combinedError.message;
      this.stack = VError.fullStack(combinedError);
    });
  }
}

module.exports.CustomVError = CustomVError;
module.exports.CustomMultiError = CustomMultiError;
