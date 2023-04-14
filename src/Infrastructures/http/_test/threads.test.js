const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread with authentication', async () => {
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'New Thread',
          body: 'Thread Body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual('New Thread');
      expect(responseJson.data.addedThread.owner).toEqual(id);
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should response detail thread with comments without authentication', async () => {
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
        title: 'New Thread',
        body: 'New Body',
        owner: userId,
      });
      // add comment
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      // add comment
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId,
        owner: userId,
        content: 'New Comment',
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual('New Thread');
      expect(responseJson.data.thread.body).toEqual('New Body');
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments.length).toEqual(1);

      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].content).toEqual('New Comment');
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies.length).toEqual(1);
    });
  });
});
