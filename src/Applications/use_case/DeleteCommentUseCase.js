class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    this._validatePayload({ commentId });

    await this._commentRepository.checkCommentIsExist({ threadId, commentId });
    await this._commentRepository.verifyCommentAccess({ commentId, owner });
    await this._commentRepository.deleteCommentById(commentId);
  }

  _validatePayload({ commentId }) {
    if (!commentId) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
    }

    if (typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;
