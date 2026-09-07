import pytest
from starlette.testclient import TestClient
import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "Butter & Bloom" in data["brand"]
    assert "088825 53333" in data["phone"]
    assert "208012" in data["location"]

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["products"]) > 0
    
    # Check Belgian Chocolate Truffle
    first_product = data["products"][0]
    assert "id" in first_product
    assert "name" in first_product
    assert "starting_price" in first_product

def test_filter_products_by_category():
    response = client.get("/api/products?category=chocolate")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for p in data["products"]:
        assert p["category"] == "chocolate"

def test_search_products():
    response = client.get("/api/products?search=velvet")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert any("Red Velvet" in p["name"] for p in data["products"])

def test_get_categories_and_occasions():
    res_cat = client.get("/api/categories")
    assert res_cat.status_code == 200
    assert len(res_cat.json()) >= 6
    
    res_occ = client.get("/api/occasions")
    assert res_occ.status_code == 200
    assert len(res_occ.json()) >= 6

def test_pincode_check_valid_kanpur():
    response = client.post("/api/pincode/check", json={"pincode": "208012"})
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is True
    assert "Darshan Purwa" in data["area"]

def test_pincode_check_invalid():
    response = client.post("/api/pincode/check", json={"pincode": "110001"})
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is False

def test_coupon_validation():
    # Valid coupon with enough amount
    response = client.post("/api/coupons/validate", json={"code": "FIRSTBITE", "amount": 699.0})
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["discount"] > 0
    
    # Below minimum order threshold
    response_low = client.post("/api/coupons/validate", json={"code": "FIRSTBITE", "amount": 200.0})
    assert response_low.status_code == 200
    assert response_low.json()["valid"] is False

def test_create_and_track_order():
    order_payload = {
        "customer_name": "Rohan Gupta",
        "phone": "9876543210",
        "email": "rohan.gupta@example.com",
        "address": "14/82, Civil Lines",
        "pincode": "208001",
        "area": "Civil Lines, Kanpur",
        "delivery_slot": "Express 2-Hour Delivery",
        "delivery_date": "Today",
        "cake_message": "Happy 25th Birthday Rohan!",
        "items": [
            {
                "id": "bk-001",
                "name": "Belgian Chocolate Truffle Cake",
                "weight": "1.0 kg",
                "price": 1099.0,
                "quantity": 1,
                "is_eggless": True,
                "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587"
            }
        ],
        "subtotal": 1099.0,
        "delivery_fee": 99.0,
        "discount": 100.0,
        "total": 1098.0,
        "payment_method": "UPI"
    }
    
    # 1. Place order
    res_order = client.post("/api/orders", json=order_payload)
    assert res_order.status_code == 201
    order_data = res_order.json()
    assert order_data["success"] is True
    order_id = order_data["order"]["id"]
    assert order_id.startswith("BK-KNP-") or order_id.startswith("BB-")
    
    # 2. Track order
    res_track = client.get(f"/api/orders/{order_id}")
    assert res_track.status_code == 200
    track_data = res_track.json()
    assert track_data["success"] is True
    assert track_data["order"]["id"] == order_id
    assert "timeline" in track_data["order"]
    assert len(track_data["order"]["timeline"]["steps"]) == 5

def test_custom_cake_inquiry():
    inquiry_payload = {
        "customer_name": "Kavita Mishra",
        "phone": "9839012345",
        "occasion": "Anniversary",
        "tier": "2-Tier",
        "flavor": "Rose Pistachio Gourmet Cake",
        "theme": "Pastel Pink & Gold Leaf",
        "notes": "Please add fresh pink edible roses and inscription: Happy 10th Anniversary",
        "estimated_price": 2899.0
    }
    response = client.post("/api/custom-cakes/inquire", json=inquiry_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["inquiry"]["id"].startswith("INQ-")
