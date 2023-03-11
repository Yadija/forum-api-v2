const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case params not contain comment id', async () => {
    // Arrange
    const useCasePayload = {};

    // Action & Assert
    await expect(new DeleteCommentUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
  });

  it('should throw error if comment id not string', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 321,
    };

    // Action & Assert
    await expect(new DeleteCommentUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-321',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist).toHaveBeenCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    expect(mockCommentRepository.verifyCommentAccess).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
