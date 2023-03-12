const DetailThread = require('../DetailThread');

describe('an DetailThread entity', () => {
  it('should throw error if payload does not meet criteria', () => {
    // arrange

    const payload = {
      id: 'thread-123',
      title: 'New Thread',
      body: 'New Body',
      username: 'user-123',
    };

    // action and assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has invalid data type', () => {
    // arrange
    const payload = {
      id: 123,
      title: true,
      body: 321,
      date: [],
      username: 789,
      comments: 'Some Comments',
    };

    // action and assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'New Thread',
      body: 'New Body',
      date: '2023',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
