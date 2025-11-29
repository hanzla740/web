from http import HTTPStatus

from flask import (
    Blueprint,
    redirect,
    render_template,
    request,
    session,
    url_for,
    flash,
)

from .database import db
from .models import AdminUser, PageSettings, CustomerInquiry


admin_bp = Blueprint("admin", __name__)


def _require_login():
    if not session.get("admin_authenticated"):
        flash("Please sign in to continue.", "error")
        return False
    return True


@admin_bp.route("/admin", methods=["GET"])
def admin_dashboard():
    is_authenticated = session.get("admin_authenticated", False)
    admin_users = []
    page_settings = {}
    inquiries = []
    inquiry_stats = {"pending": 0, "contacted": 0, "converted": 0}
    if is_authenticated:
        admin_users = AdminUser.query.order_by(AdminUser.username.asc()).all()
        for setting in PageSettings.query.all():
            page_settings[setting.key] = setting.value
        inquiries = CustomerInquiry.query.order_by(CustomerInquiry.created_at.desc()).limit(50).all()
        inquiry_stats["pending"] = CustomerInquiry.query.filter_by(status="pending").count()
        inquiry_stats["contacted"] = CustomerInquiry.query.filter_by(status="contacted").count()
        inquiry_stats["converted"] = CustomerInquiry.query.filter_by(status="converted").count()
    return render_template(
        "admin.html",
        is_authenticated=is_authenticated,
        username=session.get("admin_username"),
        admin_users=admin_users,
        current_admin_id=session.get("admin_user_id"),
        page_settings=page_settings,
        inquiries=inquiries,
        inquiry_stats=inquiry_stats,
    )


@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    user = AdminUser.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session["admin_authenticated"] = True
        session["admin_user_id"] = user.id
        session["admin_username"] = user.username
        flash("Signed in successfully.", "success")
        return redirect(url_for("admin.admin_dashboard"))

    flash("Invalid username or password.", "error")
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()
    flash("Signed out.", "success")
    return redirect(url_for("index"))


@admin_bp.route("/admin/password", methods=["POST"])
def admin_change_password():
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    current_password = request.form.get("current_password", "")
    new_password = request.form.get("new_password", "")
    confirm_password = request.form.get("confirm_password", "")

    if new_password != confirm_password:
        flash("New passwords do not match.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    user_id = session.get("admin_user_id")
    user = AdminUser.query.get(user_id)
    if not user or not user.check_password(current_password):
        flash("Current password is incorrect.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    if len(new_password) < 6:
        flash("Password must be at least 6 characters.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    user.set_password(new_password)
    db.session.commit()
    flash("Password updated.", "success")
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/users", methods=["POST"])
def admin_create_user():
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    username = request.form.get("new_username", "").strip()
    password = request.form.get("new_password", "")

    if len(username) < 3 or len(password) < 6:
        flash("Username or password too short.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    if AdminUser.query.filter_by(username=username).first():
        flash("Username already exists.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    user = AdminUser(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    flash(f"Admin account '{username}' created.", "success")
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/users/<int:user_id>/delete", methods=["POST"])
def admin_delete_user(user_id):
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    current_id = session.get("admin_user_id")
    if current_id == user_id:
        flash("You cannot delete your own account.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    total_admins = AdminUser.query.count()
    if total_admins <= 1:
        flash("Cannot delete the last admin account.", "error")
        return redirect(url_for("admin.admin_dashboard"))

    user = AdminUser.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash(f"Admin '{user.username}' deleted.", "success")
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/page-settings", methods=["POST"])
def update_page_settings():
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    text_settings = [
        "hero_title", "hero_subtitle", "hero_eyebrow", "support_phone", "support_email",
        "stat_cities", "stat_uptime", "stat_cities_label", "stat_uptime_label",
        "stat_support_value", "stat_support_label", "company_name", "company_tagline",
        "footer_tagline", "cities_list", "logo_url", "whatsapp_number",
        "facebook_url", "twitter_url", "instagram_url", "current_location",
        "promo_banner_text", "feature1_title", "feature1_desc",
        "feature2_title", "feature2_desc", "feature3_title", "feature3_desc",
        "feature4_title", "feature4_desc"
    ]
    
    checkbox_settings = [
        "promo_banner_enabled", "show_speed_test", "show_coverage_check", "features_enabled",
        "modern_theme_enabled"
    ]

    def upsert_setting(key: str, value: str):
        setting = PageSettings.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            db.session.add(PageSettings(key=key, value=value))

    for key in text_settings:
        if key in request.form:
            upsert_setting(key, request.form.get(key, "").strip())

    for key in checkbox_settings:
        if key in request.form:
            value = "true" if request.form.get(key) == "true" else "false"
            upsert_setting(key, value)

    db.session.commit()
    flash("Page settings updated successfully.", "success")
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/inquiries/<int:inquiry_id>/status", methods=["POST"])
def update_inquiry_status(inquiry_id):
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    inquiry = CustomerInquiry.query.get_or_404(inquiry_id)
    new_status = request.form.get("status", "pending")
    
    if new_status in ["pending", "contacted", "converted"]:
        inquiry.status = new_status
        db.session.commit()
        flash(f"Inquiry status updated to {new_status}.", "success")
    else:
        flash("Invalid status.", "error")
    
    return redirect(url_for("admin.admin_dashboard"))


@admin_bp.route("/admin/inquiries/<int:inquiry_id>/delete", methods=["POST"])
def delete_inquiry(inquiry_id):
    if not _require_login():
        return redirect(url_for("admin.admin_dashboard"))

    inquiry = CustomerInquiry.query.get_or_404(inquiry_id)
    db.session.delete(inquiry)
    db.session.commit()
    flash("Inquiry deleted.", "success")
    return redirect(url_for("admin.admin_dashboard"))

