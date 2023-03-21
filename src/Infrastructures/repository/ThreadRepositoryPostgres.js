const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, date],
    };

    const { rows } = await this._pool.query(query);
    return new AddedThread({ ...rows[0] });
  }

  async checkThreadById(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return rows[0];
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT threads.id, threads.title,
      threads.body, threads.date, users.username 
      FROM threads 
      INNER JOIN users ON threads.owner = users.ID
      WHERE threads.id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return new DetailThread(rows[0]);
  }

  async getRepliesByThreadId(id) {
    const query = {
      text: `SELECT replies.id, comments.id AS comment_id, 
      replies.is_deleted, replies.content, 
      replies.date, users.username 
      FROM replies 
      INNER JOIN comments ON replies.comment_id = comments.id
      INNER JOIN users ON replies.owner = users.id
      WHERE comments.thread_id = $1
      ORDER BY date ASC`,
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    return rows.map((entry) => new DetailReply({
      ...entry, commentId: entry.comment_id, isDeleted: entry.is_deleted,
    }));
  }
}

module.exports = ThreadRepositoryPostgres;
