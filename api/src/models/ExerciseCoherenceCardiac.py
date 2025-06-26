from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.ExerciseLog import ExerciseLog


class ExerciseCoherenceCardiac(SQLModel, table=True):
    __tablename__ = "exercise_coherence_cardiac"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    duration_inspiration: float
    duration_apnea: float
    duration_expiration: float
    number_cycles: int

    # Relations
    logs: List["ExerciseLog"] = Relationship(back_populates="exercise")
