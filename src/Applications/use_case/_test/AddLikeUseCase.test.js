const NewLike = require('../../../Domains/likes/entities/NewLike');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrate the add like use case properly when like doesnt exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeIsExists = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    expect(mockLikeRepository.checkLikeIsExists).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(mockLikeRepository.addLike).toBeCalledWith(new NewLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    }));
  });

  it('should orchestrate the add like use case properly when like does exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeIsExists = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLikeByCommentIdAndOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    expect(mockLikeRepository.checkLikeIsExists).toBeCalledWith({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    expect(mockLikeRepository.deleteLikeByCommentIdAndOwner).toBeCalledWith(new NewLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    }));
  });
});
