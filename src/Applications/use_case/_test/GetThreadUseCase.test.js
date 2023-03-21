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

  it('should operate the branching in the _checkIsDeletedComments function properly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'New Body',
        date: '2023',
        username: 'dicoding',
        comments: [],
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
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
      ]));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const SpyCheckIsDeletedComments = jest.spyOn(getThreadUseCase, '_checkIsDeletedComments');

    // Action
    await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(SpyCheckIsDeletedComments).toReturnWith([
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
      }]);

    SpyCheckIsDeletedComments.mockClear();
  });

  it('should operate the branching in the _getRepliesForComments function properly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'New Body',
        date: '2023',
        username: 'dicoding',
        comments: [],
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
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
      ]));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
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
          isDeleted: true,
        }),
      ]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const SpyGetRepliesForComments = jest.spyOn(getThreadUseCase, '_getRepliesForComments');

    // Action
    await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(SpyGetRepliesForComments).toReturnWith([
      {
        id: 'comment-123',
        username: 'userA',
        date: '2023',
        content: 'New Comment A',
        replies: [
          {
            id: 'reply-123',
            content: 'New Reply A',
            date: '2021',
            username: 'userC',
          },
        ],
      },
      {
        id: 'comment-321',
        username: 'userB',
        date: '2019',
        content: 'New Comment B',
        replies: [
          {
            id: 'reply-321',
            content: '**balasan telah dihapus**',
            date: '2021',
            username: 'userD',
          },
        ],
      }]);

    SpyGetRepliesForComments.mockClear();
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThreadDetail = {
      id: 'thread-123',
      title: 'New Thread',
      body: 'New Body',
      date: '2023',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'userA',
          date: '2023',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-123',
              content: 'New Reply A',
              date: '2021',
              username: 'userC',
            },
          ],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: 'thread-123',
        title: 'New Thread',
        body: 'New Body',
        date: '2023',
        username: 'dicoding',
        comments: [],
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailComment({
          id: 'comment-123',
          username: 'userA',
          date: '2023',
          content: 'New Comment A',
          replies: [],
          isDeleted: true,
        }),
      ]));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailReply({
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'New Reply A',
          date: '2021',
          username: 'userC',
          isDeleted: false,
        }),
      ]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toEqual(expectedThreadDetail);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith(useCasePayload.threadId);
  });
});
