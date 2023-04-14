const DetailComment = require('../DetailComment');

describe('an DetailComment entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange

    const payload = {
      id: 'comment-123',
      username: 'user-123',
      content: 'New Comment',
    };

    // action and assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has invalid data type', () => {
    // arrange
    const payload = {
      id: 123,
      username: {},
      date: 2023,
      content: true,
      replies: 321,
      likeCount: '0',
      isDeleted: 'false',
    };

    // action and assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      username: 'dicoding',
      date: '2023',
      content: 'New Comment',
      replies: [],
      likeCount: 0,
      isDeleted: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.likeCount).toEqual(payload.likeCount);
    expect(detailComment.isDeleted).toEqual(payload.isDeleted);
  });
});
