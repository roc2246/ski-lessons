import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import { getModel } from "./mongoose.js";

describe("getModel", () => {
  it("returns an existing model if already compiled", () => {
    const schema = new mongoose.Schema({ name: String });
    const name = "TestModel";

    const model1 = getModel(schema, name);
    const model2 = getModel(schema, name);

    expect(model1).toBe(model2);
  });

  it("creates a new model if not existing", () => {
    const schema = new mongoose.Schema({ value: Number });
    const name = "NewModel";

    const model = getModel(schema, name);
    expect(model.modelName).toBe(name);
  });
});
