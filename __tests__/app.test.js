const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
require('jest-sorted');

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
  test('status:200, reponds with matching article AND response object should also include comment count', () => {
    const article_ID = 1;
    return request(app)
    .get(`/api/articles/${article_ID}`)
    .expect(200)
    .then(({body}) => {
      const {article} = body;
      expect (article).toHaveProperty('comment_count');
      expect (article.comment_count).toBe(11);
    })
  })
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

describe('GET /api/users', () => {
  test('status of 200, responds with an array of user objects', () => {
    return request(app)
    .get('/api/users')
    .expect(200)
    .then(({ body }) => {
      const { users } = body;
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(4);
      users.forEach((user) => {
        expect(user).toEqual(
          expect.objectContaining({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
        )
      })
    })
  })
})

describe('GET /api/articles', () => {
  test('status of 200, responds with an articles array of article objects, sorted by date in descending order', () => {
    return request(app)
    .get('/api/articles')
    .expect(200)
    .then(({body}) => {
      const {articles} = body;
      expect(articles).toBeInstanceOf(Array);
      expect(articles.length).toBe(12);
      expect(articles).toBeSortedBy('created_at', {
        descending: true,
        coerce: true,
      })
      articles.forEach((article) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number)
          })
        )
      })
    })
  })
})

describe('GET /api/articles/:article_id/comments', () => {
  test('status of 200, responds with array of comments for the given article ID', () => {
    const articleID = 1
    return request(app)
    .get(`/api/articles/${articleID}/comments`)
    .expect(200)
    .then(({body}) => {
      const { comments } = body;
      expect(comments).toBeInstanceOf(Array);
      expect(comments.length).toBe(11);
      comments.forEach((comment) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1
          })
        )
      })
    })
  })
  test('400: responds with error message when passed a bad article ID', () => {
    return request(app)
    .get('/api/articles/notAnId/comments')
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Invalid input');
    })
  })
  test('404: responds with error message when article does not exist', () => {
    return request(app)
    .get('/api/articles/9999999999999/comments')
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found');
    })
  })
  test('200: responds with empty array of comments if the article DOES exist but does NOT have comments', () => {
    return request(app)
    .get('/api/articles/4/comments')
    .expect(200)
    .then(({body}) => {
      const { comments } = body;
      expect(comments).toBeInstanceOf(Array);
      expect(comments.length).toBe(0);
    })
  })
})