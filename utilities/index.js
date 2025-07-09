function argValidation(args, argNames) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) {
      throw new Error(`${argNames[i]} required`);
    }
  }
}

module.exports = {
argValidation
} 