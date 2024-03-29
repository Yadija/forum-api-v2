const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
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

  describe('getCommentsByThreadId function', () => {
    it('should return an empty array when no comments exist for the thread', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      const commentDetails = await commentRepository.getCommentsByThreadId('thread-123');
      expect(commentDetails).toStrictEqual([]);
    });

    it('should return all comments from a thread', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      const firstComment = {
        id: 'comment-123',
        content: 'First Comment',
        date: '2019',
      };
      const secondComment = {
        id: 'comment-789',
        content: 'Second Comment',
        date: '2023',
      };
      await CommentsTableTestHelper.addComment({ ...firstComment, threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ ...secondComment, threadId, owner: userId });
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const commentDetails = await commentRepository.getCommentsByThreadId('thread-123');
      expect(commentDetails).toEqual([
        new DetailComment({
          ...firstComment, username: 'dicoding', isDeleted: false, replies: [], likeCount: 0,
        }),
        new DetailComment({
          ...secondComment, username: 'dicoding', isDeleted: false, replies: [], likeCount: 0,
        }),
      ]);
    });
  });

  describe('checkCommentIsExist function', () => {
    it('should throw NotFoundError if comment not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.checkCommentIsExist({ threadId: 'thread-123', commentId: 'comment-123' }))
        .rejects.toThrowError(NotFoundError);
    });

    it('should resolve if comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.checkCommentIsExist({ threadId: 'thread-123', commentId: 'comment-123' }))
        .resolves.not.toThrowError();
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError if user has no authorization', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentAccess({ commentId: 'comment-123', owner: 'user-789' }))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should resolve if user has authorization', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.verifyCommentAccess({ commentId: 'comment-123', owner: 'user-123' }))
        .resolves.not.toThrowError();
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment that wants to be deleted does not exist', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.deleteCommentById('comment-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should be able to delete added comment by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // action
      await commentRepository.deleteCommentById('comment-123');
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');

      // assert
      expect(comment[0].is_deleted).toEqual(true);
    });
  });
});
