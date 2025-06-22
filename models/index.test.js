
import { describe, it } from "vitest"
import * as models from "."

describe("initial tests", ()=>{
    // it("should conduct initial connection test", async()=>{
    //     await models.connect()
    // })
    it("should throw error", async()=>{
        await models.connect("FAIL")
    })
})
