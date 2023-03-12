class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, commentId, content, date, username, isDeleted,
    } = payload;

    this.id = id;
    this.commentId = commentId;
    this.content = content;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
  }

  _verifyPayload(payload) {
    const {
      id, commentId, content, date, username, isDeleted,
    } = payload;

    if (!id || !commentId || !content || !date || !username || isDeleted === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof commentId !== 'string'
    || typeof content !== 'string'
    || typeof date !== 'string'
    || typeof username !== 'string'
    || typeof isDeleted !== 'boolean') {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
