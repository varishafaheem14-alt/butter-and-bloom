import json
import os
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import database

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
STATIC_DIR = os.path.join(BASE_DIR, "static")

@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield

app = FastAPI(
    title="Butter & Bloom API",
    description="Premium Bakery & Cake Delivery API for Butter & Bloom",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load helper functions for JSON data
def load_json_file(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# Request Models
class PincodeCheckRequest(BaseModel):
    pincode: str

class CouponValidateRequest(BaseModel):
    code: str
    amount: float

class OrderItem(BaseModel):
    id: str
    name: str
    weight: str
    price: float
    quantity: int
    is_eggless: bool = True
    image: Optional[str] = ""

class CreateOrderRequest(BaseModel):
    customer_name: str
    phone: str
    email: Optional[str] = ""
    address: str
    pincode: str
    area: Optional[str] = "Metro Area"
    delivery_slot: str = "Standard Delivery"
    delivery_date: str = "Today"
    cake_message: Optional[str] = ""
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 0.0
    discount: float = 0.0
    total: float
    payment_method: str = "UPI / Online"

class CustomInquiryRequest(BaseModel):
    customer_name: str
    phone: str
    occasion: str = "Celebration"
    tier: str = "1-Tier"
    flavor: str = "Belgian Chocolate Truffle"
    theme: str = "Floral Elegance"
    notes: Optional[str] = ""
    estimated_price: float = 1499.0

# ----------------- API ENDPOINTS -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "brand": "Butter & Bloom",
        "location": "178/B, Ram Krishna Nagar, Darshan Purwa, Kanpur, UP 208012",
        "phone": "088825 53333",
        "service": "2-Hour Express & Midnight Cake Delivery"
    }

@app.get("/api/products")
def get_products(
    category: Optional[str] = Query(None, description="Filter by category id"),
    occasion: Optional[str] = Query(None, description="Filter by occasion id"),
    search: Optional[str] = Query(None, description="Search term in name or description"),
    is_bestseller: Optional[bool] = Query(None, description="Filter bestsellers"),
    sort_by: Optional[str] = Query("popular", description="popular | price_low | price_high | rating")
):
    products = load_json_file("products.json")
    
    # Filter by category
    if category and category != "all":
        products = [p for p in products if p.get("category") == category]
        
    # Filter by occasion
    if occasion and occasion != "all":
        products = [p for p in products if occasion in p.get("occasions", [])]
        
    # Filter by bestseller
    if is_bestseller is not None:
        products = [p for p in products if p.get("is_bestseller") == is_bestseller]
        
    # Search filter
    if search:
        s = search.lower().strip()
        products = [
            p for p in products
            if s in p.get("name", "").lower()
            or s in p.get("tagline", "").lower()
            or s in p.get("description", "").lower()
            or any(s in tag.lower() for tag in p.get("tags", []))
            or s in p.get("category_name", "").lower()
        ]
        
    # Sorting
    if sort_by == "price_low":
        products.sort(key=lambda x: x.get("starting_price", 0))
    elif sort_by == "price_high":
        products.sort(key=lambda x: x.get("starting_price", 0), reverse=True)
    elif sort_by == "rating":
        products.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "reviews":
        products.sort(key=lambda x: x.get("reviews_count", 0), reverse=True)
        
    return {"total": len(products), "products": products}

@app.get("/api/products/{product_id}")
def get_product_detail(product_id: str):
    products = load_json_file("products.json")
    for p in products:
        if p.get("id") == product_id:
            related = [
                item for item in products 
                if item.get("category") == p.get("category") and item.get("id") != product_id
            ][:4]
            return {"product": p, "related": related}
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/api/categories")
def get_categories():
    data = load_json_file("categories.json")
    return data.get("categories", [])

@app.get("/api/occasions")
def get_occasions():
    data = load_json_file("categories.json")
    return data.get("occasions", [])

@app.get("/api/reviews")
def get_reviews():
    reviews = load_json_file("reviews.json")
    return {"reviews": reviews, "average_rating": 4.9, "total_reviews": "2,400+ in Kanpur"}

@app.post("/api/pincode/check")
def check_kanpur_pincode(payload: PincodeCheckRequest):
    data = load_json_file("categories.json")
    zones = data.get("kanpur_zones", [])
    clean_pin = payload.pincode.strip()
    
    for zone in zones:
        if zone.get("pincode") == clean_pin:
            return {
                "available": True,
                "pincode": clean_pin,
                "area": zone.get("area"),
                "delivery_time": zone.get("delivery_time"),
                "message": f"Yay! Delivery available in {zone.get('area')} ({zone.get('delivery_time')}) 🎀"
            }
            
    if clean_pin.startswith("208") and len(clean_pin) == 6:
        return {
            "available": True,
            "pincode": clean_pin,
            "area": "Kanpur Metro Area",
            "delivery_time": "Within 2-3 Hours",
            "message": "Delivery available across Kanpur Metro Area! 🎀"
        }
        
    return {
        "available": False,
        "pincode": clean_pin,
        "area": None,
        "message": "Currently Butter & Bloom delivers across all Kanpur pincodes (208001–208027). Please check your pincode."
    }

@app.post("/api/coupons/validate")
def validate_coupon(payload: CouponValidateRequest):
    data = load_json_file("categories.json")
    coupons = data.get("coupons", [])
    code = payload.code.strip().upper()
    amount = payload.amount
    
    for c in coupons:
        if c.get("code") == code:
            min_amt = c.get("min_amount", 0)
            if amount < min_amt:
                return {
                    "valid": False,
                    "message": f"Coupon '{code}' requires a minimum order value of ₹{min_amt}."
                }
                
            discount = 0.0
            if "discount_pct" in c:
                discount = round((amount * c["discount_pct"]) / 100.0, 2)
            elif "discount_amount" in c:
                discount = float(c["discount_amount"])
                
            return {
                "valid": True,
                "code": code,
                "discount": discount,
                "description": c.get("desc"),
                "message": f"Coupon applied! You saved ₹{discount:.0f} 🎉"
            }
            
    return {
        "valid": False,
        "message": "Invalid coupon code. Try 'FIRSTBITE' or 'KANPURFREE'!"
    }

@app.post("/api/orders", status_code=status.HTTP_201_CREATED)
def place_order(payload: CreateOrderRequest):
    order_dict = payload.model_dump()
    result = database.create_order(order_dict)
    return {
        "success": True,
        "message": "Order confirmed! Baking fresh for your celebration at Butter & Bloom ♡",
        "order": result
    }

@app.get("/api/orders/{order_id}")
def track_order(order_id: str):
    order = database.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found. Please verify your tracking ID.")
    return {"success": True, "order": order}

@app.post("/api/custom-cakes/inquire")
def submit_custom_cake_inquiry(payload: CustomInquiryRequest):
    result = database.save_custom_inquiry(payload.model_dump())
    return {
        "success": True,
        "message": "Custom cake request received! Our Butter & Bloom cake designer will call you within 15 minutes 🎀",
        "inquiry": result
    }

# Mount static and data assets
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if os.path.exists(DATA_DIR):
    app.mount("/data", StaticFiles(directory=DATA_DIR), name="data")

@app.get("/")
def serve_index():
    # Prefer root index.html, then static/index.html
    root_index = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    static_index = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(static_index):
        return FileResponse(static_index)
    return {"message": "Butter & Bloom API is running."}

@app.get("/{catchall:path}")
def serve_fallback(catchall: str):
    root_file = os.path.join(BASE_DIR, catchall)
    if os.path.exists(root_file) and os.path.isfile(root_file):
        return FileResponse(root_file)
    static_file = os.path.join(STATIC_DIR, catchall)
    if os.path.exists(static_file) and os.path.isfile(static_file):
        return FileResponse(static_file)
    root_index = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    return {"detail": "Not found"}
