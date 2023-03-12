const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret',
        id: 'user-123',
      });
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'New Comment',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
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
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'New Comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 201 and persisted comment with authentication', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      const addUser = await server.inject({
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
      const { id } = await addUser.result.data.addedUser;
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'Thread Body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'New Comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual('New Comment');
      expect(responseJson.data.addedComment.owner).toEqual(id);
    });
  });

  describe('when DELETE /threads/{id}/comments/{commentId}', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret',
        id: 'user-123',
      });
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      });
      // add comment
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'New Comment',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if comment not found', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      const addUser = await server.inject({
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
      const { id } = await addUser.result.data.addedUser;
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'Thread Body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
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

    it('should response 200 if authenticate and found comment', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      const addUser = await server.inject({
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
      const { id } = await addUser.result.data.addedUser;

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: id,
      });
      // add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
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
