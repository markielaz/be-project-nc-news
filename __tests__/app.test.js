const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

// before we run each test make sure the database is seeded
beforeEach(() => {
  return seed(testData);
});

// need to close the async
afterAll(() => db.end());

describe("Bad paths", () => {
  it("404: responds for invalid paths", () => {
    return request(app)
      .get("/api/topicz")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid Path");
      });
  });
});

describe("GET /api/topics", () => {
  it("200: responds with a body of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty('slug');
          expect(topic).toHaveProperty('description');
        });
      });
  });
});

describe('GET /api/articles/:article_id', () => {
  test('status:200, responds with a single matching article', () => {
    const article_ID = 1;
    return request(app)
      .get(`/api/articles/${article_ID}`)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect (article).toHaveProperty('author');
        expect (article.author).toBe('butter_bridge')
        expect (article).toHaveProperty('title');
        expect (article).toHaveProperty('article_id');
        expect (article.article_id).toBe(1);
        expect (article).toHaveProperty('body');
        expect (article).toHaveProperty('topic');
        expect (article).toHaveProperty('created_at');
        expect (article).toHaveProperty('votes');
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('STATUS CODE 200, and responds with the patched article', () => {
      const articleID = 1
      const articleUpdates = {
          "inc_votes" : 1
      };
      return request(app)
      .patch(`/api/articles/${articleID}`)
      .send(articleUpdates)
      .expect(200)
      .then(({body}) => {
        const { article } = body;
        expect (article.article_id).toBe(1);
        expect (article.votes).toBe(101);
      }).then(() => {
          return db.query('SELECT * FROM articles WHERE article_id = 1').then((results) => {
              expect(results.rows[0].votes).toBe(101);
          });
      });
  });
  test('STATUS CODE 200, updating the votes with a negative number', () => {
    const articleID = 1
    const articleUpdates = {
        "inc_votes" : -50
    };
    return request(app)
    .patch(`/api/articles/${articleID}`)
    .send(articleUpdates)
    .expect(200)
    .then(({body}) => {
      const { article } = body;
      expect (article.article_id).toBe(1);
      expect (article.votes).toBe(50);
    }).then(() => {
        return db.query('SELECT * FROM articles WHERE article_id = 1').then((results) => {
            expect(results.rows[0].votes).toBe(50);
        });
    });
});
});