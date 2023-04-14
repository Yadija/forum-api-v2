/* eslint-disable no-await-in-loop */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute({ threadId }) {
    this._verifyPayload({ threadId });

    const threadDetail = await this._threadRepository.getThreadById(threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._threadRepository.getRepliesByThreadId(threadId);

    threadDetail.comments = this._checkIsDeletedComments(threadDetail.comments);
    threadDetail.comments = this._getRepliesForComments(threadDetail.comments, threadReplies);
    threadDetail.comments = await this._getLikeCountForComments(threadDetail.comments);

    return threadDetail;
  }

  _verifyPayload({ threadId }) {
    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _checkIsDeletedComments(comments) {
    return comments.map((comment) => {
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content;
      delete comment.isDeleted;
      return comment;
    });
  }

  _getRepliesForComments(comments, threadReplies) {
    return comments.map((comment) => {
      comment.replies = threadReplies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          const { commentId, ...replyDetail } = reply;
          replyDetail.content = replyDetail.isDeleted ? '**balasan telah dihapus**' : replyDetail.content;
          delete replyDetail.isDeleted;
          return replyDetail;
        });
      return comment;
    });
  }

  async _getLikeCountForComments(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      const commentId = comments[i].id;
      comments[i].likeCount = await this._likeRepository
        .getLikeCountByCommentId(commentId);
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
