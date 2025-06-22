
import { describe, it } from "vitest"
import * as models from "."

describe("initial tests", ()=>{
    it("should conduct initial connection test", async()=>{
       const result =  await models.connect()
       console.log(result)
    })
    // it("should throw error", async()=>{
    //     await models.connect("FAIL")
    // })
})
