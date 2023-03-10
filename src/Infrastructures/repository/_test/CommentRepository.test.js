const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'New Thread', owner: 'user-123' });
      const fakeIdGenerator = () => '321'; // stub
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'New Comment',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      // Action
      await commentRepository.addComment(commentPayload);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-321');
      expect(comment).toHaveLength(1);
      expect(comment[0].id).toBe('comment-321');
      expect(comment[0].content).toBe(commentPayload.content);
      expect(comment[0].owner).toBe(commentPayload.owner);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'New Thread', owner: 'user-123' });
      const fakeIdGenerator = () => '321'; // stub
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'New Comment',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      // Action & Assert
      const comment = await commentRepository.addComment(commentPayload);
      expect(comment).toStrictEqual(new AddedComment({
        id: 'comment-321',
        content: 'New Comment',
        owner: 'user-123',
      }));
    });
  });
});
