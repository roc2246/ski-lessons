import mongoose from "mongoose";

function argValidation(args, argNames) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) throw new Error(`${argNames[i]} required`);
  }
}

function getModel(schemaDefinition, modelName) {
  const schema = new mongoose.Schema(schemaDefinition);
  console.log("schema created")
  return/*  mongoose.models[modelName] || */ mongoose.model(modelName, schema);
}

module.exports = {
  argValidation,
  getModel
};
