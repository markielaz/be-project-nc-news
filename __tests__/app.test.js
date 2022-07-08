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
    .get('/api/articles/99999/comments')
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

describe('POST /api/articles/:article_id/comments', () => {
  test('status 201, responds with posted comment', () => {
    const newComment = {
        "username": "lurker",
        "body": "this is a test comment"
    };
    const articleID = 1;
    return request(app)
    .post(`/api/articles/${articleID}/comments`)
    .send(newComment)
    .expect(201)
    .then(({ body }) => {
      expect(body.comment).toMatchObject({
        author: 'lurker',
        body: 'this is a test comment',
        comment_id: expect.any(Number),
        created_at: expect.any(String),
        votes: expect.any(Number)
      });
    })
  })
  test('404: responds with error message when article does not exist', () => {
    const newComment = {
      "username": "lurker",
      "body": "this is a test comment"
    };
    return request(app)
    .post('/api/articles/99999/comments')
    .send(newComment)
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found');
    })
  })
  test('404: responds with error message when username is not in the database', () => {
    const newComment = {
      "username": 'test-user',
      "body": "this is a test comment"
    };
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Username not found');
    })
  })
  test('400: responds with error message when passed a bad article ID', () => {
    const newComment = {
      "username": "lurker",
      "body": "this is a test comment"
    };
    return request(app)
    .post('/api/articles/notAnId/comments')
    .send(newComment)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Invalid input');
    })
  })
  test('400: responds with error message when passed wrong data type', () => {
    const newComment = {
      "username": 240,
      "body": "this is a test comment"
    };
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Invalid input');
    })
  })
  test('400: responds with error message when missing eg body', () => {
    const newComment = {
      "username": 'lurker',
    };
    return request(app)
    .post('/api/articles/1/comments')
    .send(newComment)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Invalid input');
    })
  })
})

describe("GET /api/articles (queries)", () => {
  it("200: responds with a body of articles sorted by [column]", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy('author', {
          descending: true
        });
      });
  });
  it("200: responds with a body of articles in descending order (default)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy('created_at', {
          descending: true
        });
      });
  });
  it("200: responds with a body of articles in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy('created_at', {
          descending: false
        });
      });
  });
  it("200: responds with a body of articles filtered by topic in query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        articles.forEach((article) => {
          expect(article.topic).toBe('mitch')
        })
      })
  })
  it("200: responds with empty arr if topic is valid but no articles associated", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles.length).toBe(0);
      })
  })
  it("404: responds with error message if non-existent topic is passed in", () => {
    return request(app)
      .get("/api/articles?topic=bananas")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Topic not found');
      })
  })
  it("400: responds with error message if invalid sort_by passed in", () => {
    return request(app)
      .get("/api/articles?sort_by=bananas")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid sort_by query');
      })
  })
  it("400: responds with error message if invalid order passed in", () => {
    return request(app)
      .get("/api/articles?sort_by=author&&order=banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid order query');
      })
  })
});