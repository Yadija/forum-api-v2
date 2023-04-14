const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, threadId, owner, content, date],
    };

    const { rows } = await this._pool.query(query);
    return new AddedComment({ ...rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id,
      comments.content,
      comments.date, 
      users.username,
      comments.is_deleted
      FROM comments INNER JOIN users
      ON comments.owner = users.id
      WHERE comments.thread_id = $1
      ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows.map((entry) => new DetailComment({
      ...entry, isDeleted: entry.is_deleted, replies: [], likeCount: 0,
    }));
  }

  async checkCommentIsExist({ threadId, commentId }) {
    const query = {
      text: ` SELECT 1
      FROM comments INNER JOIN threads
      ON comments.thread_id = threads.id
      WHERE threads.id = $1
      AND comments.id = $2
      `,
      values: [threadId, commentId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentAccess({ commentId, owner }) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('proses gagal karena Anda tidak mempunyai akses ke aksi ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted=TRUE WHERE id=$1 RETURNING id',
      values: [commentId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('tidak bisa menghapus comment karena comment tidak ada');
    }
  }
}

module.exports = CommentRepositoryPostgres;
