from fastapi import HTTPException
from starlette import status


class UserError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

    def __str__(self):
        return self.detail


USER_IS_DISABLED = UserError("Ce compte est désactivé")
USER_IS_DELETED = UserError("Ce compte est supprimé")
USER_DOESNT_EXISTS = UserError("Ce compte n'existe pas")

NOT_STR = "Ce champ doit être une chaine de caractère"
EMAIL_INVALID = "L'email saisi est invalide"
LOGIN_WRONG_SIZE = "Le nom d'utilisateur doit faire entre %d et %d caractères!"
LOGIN_NON_ALPHANUM = "Le nom d'utilisateur ne doit contenir que des caractères alphanumériques !"
PASSWORD_WRONG_SIZE = "faire entre %d et %d caractères"
PASSWORD_NEED_DIGIT = "contenir un chiffre"
PASSWORD_NEED_UPPER = "contenir une majuscule"
PASSWORD_NEED_LOWER = "contenir une minuscule"
PASSWORD_NEED_SPECIAL = 'contenir un caractère spécial parmis "%s"'
