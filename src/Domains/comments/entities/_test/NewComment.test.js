const NewComment = require('../NewComment');

describe('a NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'New Comment',
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      threadId: 123,
      owner: true,
    };

    // Action & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'New Comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
