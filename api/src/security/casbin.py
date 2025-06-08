import casbin
from icecream import ic

ENFORCER = casbin.Enforcer(
    "src/security/casbin-config/rbac_model.conf",
    "src/security/casbin-config/rbac_policy.csv",
)
PROTECTED_ROUTES = [route for _, route, _ in ENFORCER.get_policy()]

ic("Protected routes:")
for route in PROTECTED_ROUTES:
    ic(route)
