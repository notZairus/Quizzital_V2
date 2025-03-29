from configs import db

classroom_user_tbl = db.Table(
    'classroom_user_tbl',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('classroom_id', db.Integer, db.ForeignKey('classroom.id'), primary_key=True),
    db.Column('status', db.Enum('pending', 'accepted', name="status_enum"), nullable=False, default="pending"),
)