const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 and persisted reply without authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const userId = 'user-123';
      const server = await createServer(container);
      // add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret',
        id: userId,
      });
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      // add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'New Reply',
        },
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
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'New Reply',
        },
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

    it('should response 201 and persisted reply with authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
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
        id: threadId,
        title: 'New Thread',
        body: 'Thread Body',
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'New Reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual('New Reply');
      expect(responseJson.data.addedReply.owner).toEqual(id);
    });
  });

  describe('when DELETE /threads/{id}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 and persisted reply without authentication', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const userId = 'user-123';
      const server = await createServer(container);
      // add user
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret',
        id: userId,
      });
      // add thread
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      // add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if reply not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
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
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 200 if authenticate and found reply', async () => {
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
      const replyId = 'reply-123';
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
      // add reply
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
