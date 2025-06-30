from typing import List

from fastapi.exceptions import HTTPException
from sqlmodel import select
from src.models import ExerciseCoherenceCardiac
from src.utils.db import SessionDep


class ExerciseService:
    @classmethod
    async def get_all(cls, session: SessionDep) -> List[ExerciseCoherenceCardiac]:
        sql = select(ExerciseCoherenceCardiac)
        result = await session.exec(sql)
        exercises = result.all()
        if not exercises:
            raise HTTPException(
                status_code=404, detail="Liste des exercises non trouvée"
            )
        return exercises

    @classmethod
    async def get_exercise(
        cls, session: SessionDep, exercise_id: int
    ) -> ExerciseCoherenceCardiac:
        exercise = await session.get(ExerciseCoherenceCardiac, exercise_id)
        if not exercise:
            raise HTTPException(404, "Exercice non trouvé")
        return exercise
