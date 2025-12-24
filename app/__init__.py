import os

from flask import Flask, render_template
from flask_cors import CORS
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf

csrf = CSRFProtect()

from .database import db
from .models import AdminUser, Plan, PageSettings, CustomerInquiry
from .routes import api_blueprint
from .admin_views import admin_bp


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(__file__), "..", "static"),
        template_folder=os.path.join(os.path.dirname(__file__), "..", "templates"),
    )

    # Database Configuration - Simplified for Railway
    database_url = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    
    # For Railway, always use in-memory SQLite to avoid file system issues
    if os.getenv("RAILWAY_ENVIRONMENT"):
        database_url = "sqlite:///:memory:"
        print("Railway: Using in-memory SQLite database")
    
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Security Configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    if not app.config["SECRET_KEY"]:
        raise ValueError("SECRET_KEY environment variable must be set for production")
    
    # CSRF Configuration
    app.config["WTF_CSRF_TIME_LIMIT"] = int(os.getenv("WTF_CSRF_TIME_LIMIT", "3600"))
    
    # Session Security (for production)
    if os.getenv("FLASK_ENV") == "production":
        app.config["SESSION_COOKIE_SECURE"] = True
        app.config["SESSION_COOKIE_HTTPONLY"] = True
        app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # CORS Configuration - Restrict in production
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    db.init_app(app)
    csrf.init_app(app)

    app.register_blueprint(api_blueprint, url_prefix="/api")
    app.register_blueprint(admin_bp)

    @app.context_processor
    def inject_csrf_token():
        return {"csrf_token": generate_csrf}

    @app.route("/")
    def index():
        settings = {}
        for setting in PageSettings.query.all():
            settings[setting.key] = setting.value
        return render_template("index.html", settings=settings)

    with app.app_context():
        db.create_all()
        if AdminUser.query.count() == 0:
            default_admin = AdminUser(username="admin")
            default_admin.set_password(os.getenv("ADMIN_DEFAULT_PASSWORD", "admin123"))
            db.session.add(default_admin)
            db.session.commit()
        if Plan.query.count() == 0:
            seed_plans = [
                Plan(
                    name="Starter 50 Mbps",
                    description="Ideal for browsing, social media, and light video streaming.",
                    price=799,
                    billing_cycle="Monthly",
                    plan_type="recharge",
                    is_popular=False,
                ),
                Plan(
                    name="Power User 200 Mbps",
                    description="Great for multi-device households, UHD streaming, and casual gaming.",
                    price=1499,
                    billing_cycle="Monthly",
                    plan_type="recharge",
                    is_popular=True,
                ),
                Plan(
                    name="Fiber Max 1 Gbps",
                    description="Symmetrical gigabit speeds for creators and pro gamers.",
                    price=2499,
                    billing_cycle="Monthly",
                    plan_type="recharge",
                    is_popular=False,
                ),
                Plan(
                    name="Standard Installation",
                    description="Professional onsite setup with Wi-Fi router configuration.",
                    price=1999,
                    billing_cycle="One-time",
                    plan_type="installation",
                    is_popular=True,
                ),
                Plan(
                    name="Express Installation",
                    description="Priority scheduling and same-day activation when available.",
                    price=3499,
                    billing_cycle="One-time",
                    plan_type="installation",
                    is_popular=False,
                ),
            ]
            db.session.add_all(seed_plans)
            db.session.commit()
        if PageSettings.query.count() == 0:
            default_settings = [
                PageSettings(key="hero_title", value="Pure fiber broadband with same-day installation in your city."),
                PageSettings(key="hero_subtitle", value="Pick a recharge pack or bespoke installation plan. Every subscription includes Wi-Fi 6 router, OTT bundles, and concierge onboarding."),
                PageSettings(key="support_phone", value="+1 800 123 456"),
                PageSettings(key="support_email", value="support@sitinet.io"),
                PageSettings(key="stat_cities", value="200+"),
                PageSettings(key="stat_uptime", value="99.95%"),
                PageSettings(key="company_name", value="SitiNet"),
                PageSettings(key="company_tagline", value="Ultra Reliable Internet"),
                PageSettings(key="footer_tagline", value="Future ready connectivity"),
                PageSettings(key="cities_list", value="New Delhi • Jaipur • Indore • Pune • Kochi"),
                PageSettings(key="logo_url", value=""),
                PageSettings(key="whatsapp_number", value="+911234567890"),
                PageSettings(key="facebook_url", value=""),
                PageSettings(key="twitter_url", value=""),
                PageSettings(key="instagram_url", value=""),
                PageSettings(key="current_location", value="New Delhi"),
                PageSettings(key="promo_banner_text", value="🎉 Limited Offer: Get 3 months FREE on annual plans! Use code: FIBER2024"),
                PageSettings(key="promo_banner_enabled", value="true"),
                PageSettings(key="show_speed_test", value="true"),
                PageSettings(key="show_coverage_check", value="true"),
                PageSettings(key="stat_cities_label", value="Cities served"),
                PageSettings(key="stat_uptime_label", value="Network uptime"),
                PageSettings(key="stat_support_value", value="24/7"),
                PageSettings(key="stat_support_label", value="Engineer support"),
                PageSettings(key="hero_eyebrow", value="Fiber • Wireless • IPTV"),
                PageSettings(key="features_enabled", value="true"),
                PageSettings(key="feature1_title", value="Lightning Fast"),
                PageSettings(key="feature1_desc", value="Fiber optic speeds up to 1 Gbps with symmetrical upload/download"),
                PageSettings(key="feature2_title", value="99.95% Uptime"),
                PageSettings(key="feature2_desc", value="Enterprise-grade reliability with 24/7 network monitoring"),
                PageSettings(key="feature3_title", value="Free Equipment"),
                PageSettings(key="feature3_desc", value="Wi-Fi 6 router and installation included with every plan"),
                PageSettings(key="feature4_title", value="Same Day Setup"),
                PageSettings(key="feature4_desc", value="Quick installation with zero activation charges"),
                PageSettings(key="modern_theme_enabled", value="false"),
            ]
            db.session.add_all(default_settings)
            db.session.commit()

    return app


app = create_app()

