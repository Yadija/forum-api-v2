class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies, likeCount, isDeleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
    this.likeCount = likeCount;
    this.isDeleted = isDeleted;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, replies, likeCount, isDeleted,
    } = payload;

    if (!id
      || !username
      || !date
      || !content
      || !replies
      || likeCount === undefined
      || isDeleted === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || typeof date !== 'string'
    || typeof content !== 'string'
    || !(Array.isArray(replies))
    || typeof likeCount !== 'number'
    || typeof isDeleted !== 'boolean') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
