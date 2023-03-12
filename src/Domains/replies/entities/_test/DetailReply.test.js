const DetailReply = require('../DetailReply');

describe('a DetailReply entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange
    const payload = {
      id: 'reply-123',
      username: 'user-123',
      date: '2023',
    };

    // action & assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if payload has invalid data type', () => {
    const payload = {
      id: [],
      commentId: {},
      content: true,
      date: 2023,
      username: {},
      isDeleted: 'true',
    };

    // action & assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'New Reply',
      date: '2023',
      username: 'dicoding',
      isDeleted: false,
    };

    const addedReply = new DetailReply(payload);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.date).toEqual(payload.date);
    expect(addedReply.username).toEqual(payload.username);
    expect(addedReply.isDeleted).toEqual(payload.isDeleted);
  });
});
