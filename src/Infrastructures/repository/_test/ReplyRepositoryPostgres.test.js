const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

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
});
