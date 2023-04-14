const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  beforeEach(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    await UsersTableTestHelper.addUser({
      username: 'someuser',
      id: userId,
    });
    await ThreadsTableTestHelper.addThread({
      id: threadId,
      owner: userId,
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      owner: userId,
      threadId,
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 401 and add a like to a comment without authenticate', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    // it('should return 404 thread not found', async () => {
    //   // Arrange
    //   const requestPayload = {
    //     username: 'dicoding',
    //     password: 'secret',
    //   };
    //   const server = await createServer(container);
    //   // add user
    //   await server.inject({
    //     method: 'POST',
    //     url: '/users',
    //     payload: {
    //       username: 'dicoding',
    //       password: 'secret',
    //       fullname: 'Dicoding Indonesia',
    //     },
    //   });
    //   // login user
    //   const user = await server.inject({
    //     method: 'POST',
    //     url: '/authentications',
    //     payload: requestPayload,
    //   });
    //   const { accessToken } = await user.result.data;

    //   // Action
    //   const response = await server.inject({
    //     method: 'PUT',
    //     url: '/threads/thread-789/comments/comment-123/likes',
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });

    //   // Assert
    //   const responseJson = JSON.parse(response.payload);
    //   expect(response.statusCode).toEqual(404);
    //   expect(responseJson.status).toEqual('fail');
    //   expect(responseJson.message).toEqual('thread tidak ditemukan');
    // });

    it('should return 404 comment not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-789/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should return 200 and add or remove a like to a comment', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
