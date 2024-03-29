/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_likes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'no_duplicate_likes.comment_id_and_likes.owner', 'UNIQUE (comment_id, owner)');
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');
  pgm.dropConstraint('likes', 'fk_likes.owner_users.id');
  pgm.dropConstraint('likes', 'no_duplicate_likes.comment_id_and_likes.owner');
  pgm.dropTable('likes');
};
