class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      threadId, commentId, replyId, owner,
    } = useCasePayload;
    this._validatePayload({ replyId });

    await this._replyRepository.checkReplyIsExist({ threadId, commentId, replyId });
    await this._replyRepository.verifyReplyAccess({ replyId, owner });
    await this._replyRepository.deleteReplyById(replyId);
  }

  _validatePayload({ replyId }) {
    if (!replyId) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_REPLY_ID');
    }

    if (typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
