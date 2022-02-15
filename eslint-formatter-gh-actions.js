'use strict';
module.exports = function(results) {
  let result = '';
  results.forEach((file) => {
    if (file.messages) {
      file.messages.forEach((message) => {
        result += `::warning file=${file.filePath},line=${message.line},col=${message.col},endLine=${message.endLine},endColumn=${message.endColumn}::${message.message} (${message.ruleId})\n`;
      });
    }
  });
  return result;
};
