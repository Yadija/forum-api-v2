const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const commentPayload = {
      ...request.payload,
      threadId: request.params.threadId,
      owner: request.auth.credentials.id,
    };
    const addedComment = await addCommentUseCase.execute(commentPayload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
