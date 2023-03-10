const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
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
});
