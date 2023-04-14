const AddLikeUseCase = require('../../../../Applications/use_case/AddLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request) {
    const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);
    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.id,
    };
    await addLikeUseCase.execute(useCasePayload);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
