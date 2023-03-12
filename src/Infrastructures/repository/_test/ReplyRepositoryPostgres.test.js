const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepository postgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const fakeIdGenerator = () => '321'; // stub
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const replyPayload = {
        content: 'New Reply',
        commentId,
        owner: 'user-123',
      };

      // Action
      await replyRepository.addReply(replyPayload);

      // Assert
      const comment = await RepliesTableTestHelper.findReplyById('reply-321');
      expect(comment).toHaveLength(1);
      expect(comment[0].id).toBe('reply-321');
      expect(comment[0].content).toBe(replyPayload.content);
      expect(comment[0].owner).toBe(replyPayload.owner);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const fakeIdGenerator = () => '321'; // stub
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const replyPayload = {
        content: 'New Reply',
        commentId,
        owner: userId,
      };

      // Action & Assert
      const reply = await replyRepository.addReply(replyPayload);
      expect(reply).toStrictEqual(new AddedReply({
        id: 'reply-321',
        content: 'New Reply',
        owner: userId,
      }));
    });
  });

  describe('checkReplyIsExist function', () => {
    it('should throw NotFoundError if reply not found', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyIsExist({ threadId: 'thread-123', commentId: 'comment-123', replyId: 'reply-123' }))
        .rejects.toThrowError(NotFoundError);
    });

    it('should resolve if reply exists', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: userId,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.checkReplyIsExist({ threadId, commentId, replyId }))
        .resolves.not.toThrowError();
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError if user has no authorization', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: userId,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyAccess({ replyId, owner: 'user-789' }))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should resolve if user has authorization', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: userId,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.verifyReplyAccess({ replyId, owner: userId }))
        .resolves.not.toThrowError();
    });
  });

  describe('deleteReplyById function', () => {
    it('should throw NotFoundError when reply that wants to be deleted does not exist', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepository.deleteReplyById('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should be able to delete added reply by id', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        owner: userId,
      });
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // action
      await replyRepository.deleteReplyById(replyId);
      const reply = await RepliesTableTestHelper.findReplyById(replyId);

      // assert
      expect(reply[0].is_deleted).toEqual(true);
    });
  });
});
