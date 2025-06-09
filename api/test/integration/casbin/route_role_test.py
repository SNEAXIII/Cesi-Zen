import casbin
import pytest

from src.enums.Roles import Roles
from src.security.casbin import enforce

enforcer = casbin.Enforcer(
    "src/security/casbin-config/rbac_model.conf",
    "src/security/casbin-config/rbac_policy.csv",
)

POST = "POST"
GET = "GET"
PATCH = "PATCH"
DELETE = "DELETE"
ANONYMOUS_ROLE = {
    Roles.ANONYMOUS: True,
    Roles.USER: True,
    Roles.ADMIN: True,
}
USER_ROLE = {
    Roles.ANONYMOUS: False,
    Roles.USER: True,
    Roles.ADMIN: True,
}
ADMIN_ROLE = {
    Roles.ANONYMOUS: False,
    Roles.USER: False,
    Roles.ADMIN: True,
}


def generate_data_set_for_a_route(
    method: str, route: str, selected_role: dict[str, bool]
):
    return [
        (role, route, method, expected_result)
        for role, expected_result in selected_role.items()
    ]


def generate_data_set_for_all_route(
    test_cases: list[list[str | dict[Roles, bool]]],
):
    to_return = []
    for test_case in test_cases:
        method, route, selected_role = test_case
        data_set = generate_data_set_for_a_route(method, route, selected_role)
        to_return.extend(data_set)
    return to_return


@pytest.mark.parametrize(
    "role,route,method,expected_result",
    generate_data_set_for_all_route(
        [
            [POST, "/auth/login", ANONYMOUS_ROLE],
            [POST, "/auth/register", ANONYMOUS_ROLE],
            [PATCH, "/admin/users/disable/a8920a55-77df-493a-8c8a-7c9c98657b44", ADMIN_ROLE],
            [PATCH, "/admin/users/enable/a8920a55-77df-493a-8c8a-7c9c98657b44", ADMIN_ROLE],
            [DELETE, "/admin/users/disable/a8920a55-77df-493a-8c8a-7c9c98657b44", ADMIN_ROLE],
        ]
    ),
)
def test_routes(role, route, method, expected_result):
    # Act
    result = enforce(role, route, method)

    # Assert
    assert result == expected_result, (
        f"\nTest Failed for the following parameters:\n"
        f"   Role: {role}\n"
        f"   Route: {route}\n"
        f"   Method: {method}\n"
        f"\n"
        f"Expected Result: {expected_result}\n"
        f"Actual Result: {result}\n"
        f"\n"
    )
