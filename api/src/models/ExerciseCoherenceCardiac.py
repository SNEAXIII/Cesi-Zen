from typing import Optional
from sqlmodel import Field, SQLModel


class ExerciseCoherenceCardiac(SQLModel, table=True):
    __tablename__ = "exercise_coherence_cardiac"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    duration_inspiration: float
    duration_apnea: float
    duration_expiration: float
    number_cycles: int
