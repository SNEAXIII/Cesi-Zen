def generate_validation_error_template_for_field(
    loc: str, message: str
) -> dict[str, str | list[str]]:
    return {
        "type": "value_error",
        "loc": ["body", loc],
        "msg": message,
    }


PASSWORD_UNEQUAL_ERROR = generate_validation_error_template_for_field(
    "confirm_password", "Les mots de passe ne sont pas identiques"
)
EMAIL_ALREADY_EXISTS_ERROR = generate_validation_error_template_for_field(
    "email",
    "Cette adresse mail existe déjà",
)
LOGIN_ALREADY_EXISTS_ERROR = generate_validation_error_template_for_field(
    "login",
    "Ce nom d'utilisateur existe déjà",
)
