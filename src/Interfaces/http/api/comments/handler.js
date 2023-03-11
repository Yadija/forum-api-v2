const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

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

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const useCaseParams = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      owner: request.auth.credentials.id,
    };
    await deleteCommentUseCase.execute(useCaseParams);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
