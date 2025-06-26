from fastapi import HTTPException
from starlette import status


class UserLoginError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

    def __str__(self):
        return self.detail

class UserAdminError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    def __str__(self):
        return self.detail


USER_IS_DISABLED = UserLoginError("Ce compte est désactivé")
USER_IS_DELETED = UserLoginError("Ce compte est supprimé")
USER_DOESNT_EXISTS = UserLoginError("Le nom d'utilisateur ou le mot de passe sont incorrect")

NOT_STR = "Ce champ doit être une chaine de caractère"
EMAIL_INVALID = "L'email saisi est invalide"
LOGIN_WRONG_SIZE = "Le nom d'utilisateur doit faire entre %d et %d caractères!"
LOGIN_NON_ALPHANUM = (
    "Le nom d'utilisateur ne doit contenir que des caractères alphanumériques !"
)
PASSWORD_WRONG_SIZE = "faire entre %d et %d caractères"
PASSWORD_NEED_DIGIT = "contenir un chiffre"
PASSWORD_NEED_UPPER = "contenir une majuscule"
PASSWORD_NEED_LOWER = "contenir une minuscule"
PASSWORD_NEED_SPECIAL = 'contenir un caractère spécial parmis "%s"'

TARGET_USER_DISABLED_SUCCESSFULLY = "Le compte cible a bien été désactivé"
TARGET_USER_ENABLED_SUCCESSFULLY = "Le compte cible a bien été activé"
TARGET_USER_DELETED_SUCCESSFULLY = "Le compte cible a bien été supprimé"
TARGET_USER_DOESNT_EXISTS = UserAdminError("Le compte cible n'existe pas")
TARGET_USER_IS_ADMIN = UserAdminError("Le compte cible est un administrateur")
TARGET_USER_IS_ALREADY_ENABLED = UserAdminError("Le compte cible est déjà activé")
TARGET_USER_IS_ALREADY_DISABLED = UserAdminError("Le compte cible est déjà désactivé")
TARGET_USER_IS_DELETED = UserAdminError("Le compte cible est supprimé")
TARGET_USER_IS_ALREADY_DELETED = UserAdminError("Le compte cible est déjà supprimé")
