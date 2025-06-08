from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.User import User
    from src.models.ExerciseCoherenceCardiac import ExerciseCoherenceCardiac


class ExerciseLog(SQLModel, table=True):
    __tablename__ = "exercise_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    date_execution: datetime = Field(default_factory=datetime.now)
    id_user: str = Field(foreign_key="user.id")
    exercise_coherence_cardiac_id: int = Field(
        foreign_key="exercise_coherence_cardiac.id"
    )

    # Relations
    user: "User" = Relationship(back_populates="exercises")
    exercise: "ExerciseCoherenceCardiac" = Relationship(back_populates="logs")
