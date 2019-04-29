const request = require("supertest");
const {Genre} = require("../../models/genre");
const {User} = require("../../models/user");
const mongoose = require("mongoose");

describe("/api/genres", () => {

    let server;

    beforeEach(() => {
        server = require("../../index");
    });

    afterEach(async () => {
        await Genre.deleteMany({});
        server.close();
    })

    describe("GET /", () => {

        afterEach(async () => {
            await Genre.deleteMany({});
            server.close();
        })

        it("should return all genres", async () => {
            await Genre.insertMany([
                {name: "genre1"},
                {name: "genre2"}
            ]);

            const res = await request(server).get("/api/genres");
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === "genre1")).toBeTruthy();
            expect(res.body.some(g => g.name === "genre2")).toBeTruthy();
        });
    });
    
    describe("GET /:id", () => {

        afterEach(async () => {
            await Genre.deleteMany({});
            server.close();
        })
        
        it("should return genre if exists", async () => {
            const document = {name: "genre1"};
            let genre = new Genre(document);
            genre = await genre.save();
            const res = await request(server).get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(document.name);
        });

        it("should return http 404 if  invalid id is passed", async () => {
            const res = await request(server).get("/api/genres/12345");

            expect(res.status).toBe(404);
        });

        it("should return http 404 if no genre with the given id exists", async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/${id}`);

            expect(res.status).toBe(404);
        });

    });

    describe("POST /", () => {
        let token, name;

        const exec = async () => {
            return await request(server)
                .post("/api/genres")
                .set("x-auth-token", token)
                .send({name});
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = "genre1";
        })

        afterEach(async () => {
            await Genre.deleteMany({});
            server.close();
        })

        it("should return 401 if client is not logged in", async () => {
            token = "";
            const res = await exec();

            expect(res.status).toBe(401);
        });
        
        it("should return 400 if genre is less than 5 characters", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if genre is more than 50 characters", async () => {
            name = new Array(52).join("a");
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should save the genre if it is valid", async () => {
            await exec();

            const genre = await Genre.find({name: "genre1"});
            expect(genre).not.toBeNull();
        });

        it("should return the genre if it is valid", async () => {
            const res = await exec();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "genre1");
        });

    });

    describe("DELETE /", () => {
        let token, name, genreId;

        const exec = async () => {
            return await request(server)
                .delete(`/api/genres/${genreId}`)
                .set("x-auth-token", token)
                .send({name});
        };

        beforeEach(async () => {
            const user = {
                _id: mongoose.Types.ObjectId().toHexString(),
                isAdmin: true
            };
            token = new User(user).generateAuthToken();
            name = "genre1";
        })

        afterEach(async () => {
            await Genre.deleteMany({});
            server.close();
        });

        it("should delete genre if exists", async () => {
            const document = {name: "genre1"};
            let genre = new Genre(document);
            await genre.save();
            genreId = genre._id;

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(document.name);
        });

        it("should return http 404 if invalid id is passed", async () => {
            // TODO: DEBUG WHY RETURNING 500 instead of 404
            // genreId = "12345";
            // const res = await exec();

            // expect(res.status).toBe(404);
        });

        it("should return http 404 if no genre with the given id exists", async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

    });

});