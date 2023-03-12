const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should throw error if use case params not contain thread id', async () => {
    // Arrange
    const useCasePayload = {};

    // Action & Assert
    await expect(new GetThreadUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error if thread id not string', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 321,
    };

    // Action & Assert
    await expect(new GetThreadUseCase({}).execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should operate the branching in the _checkIsDeletedComments function properly', () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {}, likeRepository: {} },
    );
    const retrievedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'userA',
        date: '2023',
        content: 'New Comment A',
        replies: [],
        isDeleted: true,
      }),
      new DetailComment({
        id: 'comment-321',
        username: 'userB',
        date: '2019',
        content: 'New Comment B',
        replies: [],
        isDeleted: false,
      }),
    ];
    const {
      isDeleted: isDeletedCommentA,
      ...filteredCommentDetailsA
    } = retrievedComments[0];
    const {
      isDeleted: isDeletedCommentB,
      ...filteredCommentDetailsB
    } = retrievedComments[1];
    const SpyCheckIsDeletedComments = jest.spyOn(getThreadUseCase, '_checkIsDeletedComments');

    // Action
    getThreadUseCase._checkIsDeletedComments(retrievedComments);

    // Assert
    expect(SpyCheckIsDeletedComments)
      .toReturnWith([
        { ...filteredCommentDetailsA, content: '**komentar telah dihapus**' },
        filteredCommentDetailsB]);

    SpyCheckIsDeletedComments.mockClear();
  });

  /*  */
  it('should operate the branching in the _getRepliesForComments function properly', () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );
    const filteredComments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2023',
        content: '**komentar telah dihapus**',
        replies: [],
      },
      {
        id: 'comment-321',
        username: 'userB',
        date: '2019',
        content: 'New Comment B',
        replies: [],
      },
    ];

    const retrievedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'New Reply A',
        date: '2021',
        username: 'userC',
        isDeleted: true,
      }),
      new DetailReply({
        id: 'reply-321',
        commentId: 'comment-321',
        content: 'New Reply B',
        date: '2021',
        username: 'userD',
        isDeleted: false,
      }),
    ];

    const {
      commentId: commentIdReplyA, isDeleted: isDeletedReplyA,
      ...filteredReplyDetailsA
    } = retrievedReplies[0];
    const {
      commentId: commentIdReplyB, isDeleted: isDeletedReplyB,
      ...filteredReplyDetailsB
    } = retrievedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredComments[0], replies: [{ ...filteredReplyDetailsA, content: '**balasan telah dihapus**' }] },
      { ...filteredComments[1], replies: [filteredReplyDetailsB] },
    ];

    const SpyGetRepliesForComments = jest.spyOn(getThreadUseCase, '_getRepliesForComments');

    // Action
    getThreadUseCase
      ._getRepliesForComments(filteredComments, retrievedReplies);

    // Assert
    expect(SpyGetRepliesForComments)
      .toReturnWith(expectedCommentsAndReplies);

    SpyGetRepliesForComments.mockClear();
  });
  /*  */

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-321',
    };
    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'New Thread',
      body: 'New Body',
      date: '2023',
      username: 'dicoding',
      comments: [],
    });

    const retrievedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'userA',
        date: '2023',
        content: 'New Comment A',
        replies: [],
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-321',
        username: 'userB',
        date: '2019',
        content: 'New Comment B',
        replies: [],
        isDeleted: false,
      }),
    ];

    const retrievedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'New Reply A',
        date: '2021',
        username: 'userC',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-321',
        commentId: 'comment-321',
        content: 'New Reply B',
        date: '2021',
        username: 'userD',
        isDeleted: false,
      }),
    ];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedComments));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedReplies));

    // Action
    await new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    }).execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith(useCasePayload.threadId);
  });
});
