const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should throw error if use case params not contain reply id', async () => {
    // Arrange
    const useCasePayload = {};

    // Action & Assert
    await expect(new DeleteReplyUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_REPLY_ID');
  });

  it('should throw error if reply id not string', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 321,
    };

    // Action & Assert
    await expect(new DeleteReplyUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-321',
      commentId: 'comment-123',
      replyId: 'reply-789',
      owner: 'user-123',
    };
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.checkReplyIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    }).execute(useCasePayload);

    // Assert
    expect(mockReplyRepository.checkReplyIsExist).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      replyId: useCasePayload.replyId,
    });
    expect(mockReplyRepository.verifyReplyAccess).toHaveBeenCalledWith({
      replyId: useCasePayload.replyId,
      owner: useCasePayload.owner,
    });
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
