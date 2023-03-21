const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addedThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '321'; // stub
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      };

      // Action
      await threadRepository.addThread(threadPayload);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-321');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe('thread-321');
      expect(threads[0].title).toBe(threadPayload.title);
      expect(threads[0].owner).toBe(threadPayload.owner);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '321'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      };

      // Action & Assert
      const thread = await threadRepositoryPostgres.addThread(threadPayload);
      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-321',
        title: 'New Thread',
        owner: 'user-123',
      }));
    });
  });

  describe('checkThreadById function', () => {
    it('should throw NotFoundError if thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread by id', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub
      await ThreadsTableTestHelper.addThread({
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      const thread = await threadRepository.checkThreadById('thread-123');
      expect(thread).toBeDefined();
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError if thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread when thread is found', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub
      const expectedThread = new DetailThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'Thread Body',
        date: '2023',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        title: expectedThread.title,
        body: expectedThread.body,
        owner: userId,
        date: expectedThread.date,
      });
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const threadDetail = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(threadDetail).toStrictEqual(expectedThread);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return all of the replies in a thread', async () => {
      // Arrange
      const usernameA = 'dicodingA';
      const usernameB = 'dicodingB';

      const userIdA = 'user-123';
      const userIdB = 'user-789';

      const threadId = 'thread-123';

      const commentIdA = 'comment-123';
      const commentIdB = 'comment-789';

      await UsersTableTestHelper.addUser({ id: userIdA, username: usernameA });
      await UsersTableTestHelper.addUser({ id: userIdB, username: usernameB });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userIdA });

      await CommentsTableTestHelper.addComment({ id: commentIdA, owner: userIdA, threadId });
      await CommentsTableTestHelper.addComment({ id: commentIdB, owner: userIdB, threadId });

      const replyA = {
        id: 'reply-123', commentId: commentIdA, content: 'New Reply A', date: '2019', isDeleted: false,
      };
      const replyB = {
        id: 'reply-789', commentId: commentIdB, content: 'New Reply B', date: '2023', isDeleted: false,
      };

      const expectedReplies = [
        { ...replyA, username: usernameB }, { ...replyB, username: usernameA },
      ];

      await RepliesTableTestHelper.addReply({ ...replyA, owner: userIdB });
      await RepliesTableTestHelper.addReply({ ...replyB, owner: userIdA });

      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const retrievedReplies = await threadRepository.getRepliesByThreadId('thread-123');

      // Assert
      expect(retrievedReplies).toEqual(expectedReplies);
    });
  });
});
