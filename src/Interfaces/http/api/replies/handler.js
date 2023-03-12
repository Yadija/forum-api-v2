const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const replyPayload = {
      ...request.payload,
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.id,
    };
    const addedReply = await addReplyUseCase.execute(replyPayload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const useCaseParams = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      replyId: request.params.replyId,
      owner: request.auth.credentials.id,
    };
    await deleteReplyUseCase.execute(useCaseParams);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
