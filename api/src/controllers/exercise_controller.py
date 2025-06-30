from typing import List

from fastapi import APIRouter
from src.models import ExerciseCoherenceCardiac
from src.services.ExerciseService import ExerciseService
from src.utils.db import SessionDep

exercise_controller = APIRouter(
    prefix="/exercises",
    tags=["Exercises"],
)


@exercise_controller.get("/", response_model=List[ExerciseCoherenceCardiac])
async def get_all_exercises(session: SessionDep):
    result = await ExerciseService.get_all(session)
    return result


@exercise_controller.get("/{exercise_id}", response_model=ExerciseCoherenceCardiac)
async def get_exercise(exercise_id: int, session: SessionDep):
    result = await ExerciseService.get_exercise(session, exercise_id)
    return result
