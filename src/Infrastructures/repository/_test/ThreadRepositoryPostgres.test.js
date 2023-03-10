const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
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
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '321'; // stub
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      };

      await threadRepository.addThread(threadPayload);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-321');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe('thread-321');
      expect(threads[0].title).toBe(threadPayload.title);
      expect(threads[0].owner).toBe(threadPayload.owner);
    });

    it('should return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const fakeIdGenerator = () => '321'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'New Thread',
        body: 'Thread Body',
        owner: 'user-123',
      };

      const thread = await threadRepositoryPostgres.addThread(threadPayload);

      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-321',
        title: 'New Thread',
        owner: 'user-123',
      }));
    });
  });
});
