from http import HTTPStatus

from flask import Blueprint, jsonify, request, session

from .database import db
from .models import Plan, CustomerInquiry
from . import csrf

ALLOWED_PLAN_TYPES = {"recharge", "installation"}

api_blueprint = Blueprint("api", __name__)


def _require_admin():
    return bool(session.get("admin_authenticated"))


@api_blueprint.route("/plans", methods=["GET"])
def list_plans():
    plan_type = request.args.get("type")
    query = Plan.query
    if plan_type:
        query = query.filter(Plan.plan_type == plan_type.lower())
    plans = query.order_by(Plan.price.asc()).all()
    return jsonify([plan.to_dict() for plan in plans])


@api_blueprint.route("/plans", methods=["POST"])
def create_plan():
    if not _require_admin():
        return jsonify({"message": "Unauthorized"}), HTTPStatus.UNAUTHORIZED

    payload = request.get_json(force=True)
    required_fields = {"name", "description", "price", "billing_cycle", "plan_type"}
    if not required_fields.issubset(payload):
        return (
            jsonify({"message": "Missing required fields", "required": list(required_fields)}),
            HTTPStatus.BAD_REQUEST,
        )

    plan_type = payload["plan_type"].lower()
    if plan_type not in ALLOWED_PLAN_TYPES:
        return (
            jsonify({"message": f"plan_type must be one of {sorted(ALLOWED_PLAN_TYPES)}"}),
            HTTPStatus.BAD_REQUEST,
        )

    plan = Plan(
        name=payload["name"],
        description=payload["description"],
        price=float(payload["price"]),
        billing_cycle=payload["billing_cycle"],
        plan_type=plan_type,
        is_popular=bool(payload.get("is_popular", False)),
    )

    db.session.add(plan)
    db.session.commit()

    return jsonify(plan.to_dict()), HTTPStatus.CREATED


@api_blueprint.route("/plans/<int:plan_id>", methods=["PUT"])
def update_plan(plan_id):
    if not _require_admin():
        return jsonify({"message": "Unauthorized"}), HTTPStatus.UNAUTHORIZED

    plan = Plan.query.get_or_404(plan_id)
    payload = request.get_json(force=True)

    for key in ["name", "description", "price", "billing_cycle", "plan_type", "is_popular"]:
        if key in payload:
            if key == "price":
                setattr(plan, key, float(payload[key]))
            elif key == "plan_type" and payload[key]:
                normalized = payload[key].lower()
                if normalized not in ALLOWED_PLAN_TYPES:
                    return (
                        jsonify({"message": f"plan_type must be one of {sorted(ALLOWED_PLAN_TYPES)}"}),
                        HTTPStatus.BAD_REQUEST,
                    )
                setattr(plan, key, normalized)
            else:
                setattr(plan, key, payload[key])

    db.session.commit()
    return jsonify(plan.to_dict())


@api_blueprint.route("/plans/<int:plan_id>", methods=["DELETE"])
def delete_plan(plan_id):
    if not _require_admin():
        return jsonify({"message": "Unauthorized"}), HTTPStatus.UNAUTHORIZED

    plan = Plan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Plan deleted"})


@api_blueprint.route("/inquiries", methods=["POST"])
@csrf.exempt
def create_inquiry():
    payload = request.get_json(force=True)
    required_fields = {"full_name", "phone", "email", "pin_code"}
    if not required_fields.issubset(payload):
        return (
            jsonify({"message": "Missing required fields", "required": list(required_fields)}),
            HTTPStatus.BAD_REQUEST,
        )

    inquiry = CustomerInquiry(
        full_name=payload["full_name"],
        phone=payload["phone"],
        email=payload["email"],
        pin_code=payload["pin_code"],
        plan_interest=payload.get("plan_interest", ""),
        preferred_time=payload.get("preferred_time", ""),
        message=payload.get("message", ""),
    )

    db.session.add(inquiry)
    db.session.commit()

    return jsonify(inquiry.to_dict()), HTTPStatus.CREATED

