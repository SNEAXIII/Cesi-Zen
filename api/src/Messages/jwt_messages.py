from fastapi import HTTPException
from starlette import status


class JwtError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

    def __str__(self):
        return self.detail


class JwtCredentialsError(JwtError):
    def __init__(self, detail: str):
        super().__init__(detail=detail)


EXPIRED_EXCEPTION = JwtError("Le token a expiré, veuillez vous reconnecter")
CANT_FIND_USER_TOKEN_EXCEPTION = JwtError("L'utilisateur n'a pas pu être trouvé dans le token")
INVALID_ROLE_EXCEPTION = JwtError("Le role dans le token n'est pas valide")
INSUFFISANT_ROLE_EXCEPTION = JwtError("Le role n'est pas suffisant, accès refusé")
CREDENTIALS_EXCEPTION = JwtCredentialsError("Les identifiants saisis sont incorrects")
