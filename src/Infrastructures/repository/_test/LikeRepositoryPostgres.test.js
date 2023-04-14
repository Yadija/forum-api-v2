const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const NewLike = require('../../../Domains/likes/entities/NewLike');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('ReplyRepository postgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const fakeIdGenerator = () => '321'; // stub
      const likeRepository = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const newLike = new NewLike({
        commentId,
        owner: userId,
      });

      // Action
      const addedLike = await likeRepository.addLike(newLike);

      // Assert
      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner(newLike);
      expect(addedLike).toStrictEqual(({
        id: 'like-321',
      }));
      expect(like[0]).toStrictEqual({
        id: 'like-321',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should get right likeCount #1', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepository.getLikeCountByCommentId(commentId);

      // Assert
      expect(likeCount).toEqual(1);
    });

    it('should get right likeCount #2', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepository.getLikeCountByCommentId(commentId);

      // Assert
      expect(likeCount).toEqual(0);
    });
  });

  describe('checkLikeIsExists function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const statusCheck = await likeRepository.checkLikeIsExists({ commentId, owner: userId });
      expect(statusCheck).toEqual(true);
    });

    it('should return false if like does not exists', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const statusCheck = await likeRepository.checkLikeIsExists({ commentId, owner: userId });
      expect(statusCheck).toEqual(false);
    });
  });

  describe('deleteLikeByCommentIdAndOwner function', () => {
    it('should throw NotFoundError when deleting non-existing like', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepository.deleteLikeByCommentIdAndOwner({ commentId, owner: userId }))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when deleting like', async () => {
      // Arrange
      const userId = 'user-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // action & Assert
      await expect(likeRepository.deleteLikeByCommentIdAndOwner({ commentId, owner: userId }))
        .resolves.not.toThrowError();
    });
  });
});
