from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.ExerciseLog import ExerciseLog


class ExerciseCoherenceCardiac(SQLModel, table=True):
    __tablename__ = "exercise_coherence_cardiac"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    durationInspiration: float
    durationApnea: float
    durationExpiration: float
    numberCycles: int

    # Relations
    logs: List["ExerciseLog"] = Relationship(back_populates="exercise")
