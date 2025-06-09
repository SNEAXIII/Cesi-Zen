import casbin
from icecream import ic

_enforcer = casbin.Enforcer(
    "src/security/casbin-config/rbac_model.conf",
    "src/security/casbin-config/rbac_policy.csv",
)
PROTECTED_ROUTES = [route for _, route, _ in _enforcer.get_policy()]

ic("Protected routes:")
for route in PROTECTED_ROUTES:
    ic(route)

def enforce(role:str, uri:str, method:str)->bool:
    return _enforcer.enforce(role, uri, method)