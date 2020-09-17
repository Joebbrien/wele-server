const request = require("supertest");
const server = require("../userApp");
const user = require("../src/models/user");
const chai = require("chai");
after(async () => {
  console.log("Cleaning up test environment ...");
  if (await user.db.dropDatabase()) {
    console.log("Successful.");
  } else {
    console.log("Failed to clean up environment.");
  }
});


describe("WELE UNIT AND INTEGRATED TESTS",(done)=>{
  context("RUNNING USER TESTS", function(){
    it("/create should create a user account ",async ()=>{
      const user ={
        firstName: "Joebbrien",
        lastName: "Bundabunda",
        userPassword: "pass12345",
        userPhone: 260963671071
      }
      const response = await request(server).post("/api/v1/user/create").send(user);
      chai.expect(response.body.status).to.equal(201);
      console.log("user: ",response.body);
        })
  })
})
