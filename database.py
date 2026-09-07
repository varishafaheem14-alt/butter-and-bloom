import sqlite3
import json
import datetime
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'bakingo.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        pincode TEXT,
        area TEXT,
        delivery_slot TEXT,
        delivery_date TEXT,
        cake_message TEXT,
        items_json TEXT,
        subtotal REAL,
        delivery_fee REAL,
        discount REAL,
        total REAL,
        payment_method TEXT,
        status TEXT,
        created_at TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS custom_cake_inquiries (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        phone TEXT,
        occasion TEXT,
        tier TEXT,
        flavor TEXT,
        theme TEXT,
        notes TEXT,
        estimated_price REAL,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()

def create_order(order_data: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    
    # Generate unique Kanpur tracking ID e.g., BK-KNP-7842
    order_id = f"BK-KNP-{random.randint(1000, 9999)}"
    created_at = datetime.datetime.now().isoformat()
    status = "Confirmed"
    
    cursor.execute("""
    INSERT INTO orders (
        id, customer_name, phone, email, address, pincode, area,
        delivery_slot, delivery_date, cake_message, items_json,
        subtotal, delivery_fee, discount, total, payment_method, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_id,
        order_data.get('customer_name', 'Guest'),
        order_data.get('phone', ''),
        order_data.get('email', ''),
        order_data.get('address', ''),
        order_data.get('pincode', '208012'),
        order_data.get('area', 'Darshan Purwa, Kanpur'),
        order_data.get('delivery_slot', 'Standard Delivery'),
        order_data.get('delivery_date', 'Today'),
        order_data.get('cake_message', ''),
        json.dumps(order_data.get('items', [])),
        order_data.get('subtotal', 0.0),
        order_data.get('delivery_fee', 0.0),
        order_data.get('discount', 0.0),
        order_data.get('total', 0.0),
        order_data.get('payment_method', 'UPI / Online'),
        status,
        created_at
    ))
    conn.commit()
    conn.close()
    
    return {
        'id': order_id,
        'status': status,
        'created_at': created_at,
        'total': order_data.get('total', 0.0),
        'customer_name': order_data.get('customer_name'),
        'pincode': order_data.get('pincode')
    }

def get_order_by_id(order_id: str) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    order = dict(row)
    try:
        order['items'] = json.loads(order['items_json'])
    except Exception:
        order['items'] = []
    
    created_dt = datetime.datetime.fromisoformat(order['created_at'])
    now_dt = datetime.datetime.now()
    diff_minutes = (now_dt - created_dt).total_seconds() / 60.0
    
    if diff_minutes < 2:
        current_step = 1
        step_title = "Order Confirmed & Sent to Kanpur Kitchen"
        estimated_delivery = "Preparing fresh in kitchen (178/B, Darshan Purwa)"
    elif diff_minutes < 5:
        current_step = 2
        step_title = "Master Baker Crafting & Icing Your Cake"
        estimated_delivery = "Fresh sponge baked, applying artisan frosting"
    elif diff_minutes < 10:
        current_step = 3
        step_title = "Quality Check & Pink Gift Box Packaging"
        estimated_delivery = "Sealed with satin ribbon, candle & knife packed"
    elif diff_minutes < 20:
        current_step = 4
        step_title = "Out for Express Delivery with Kanpur Rider"
        estimated_delivery = f"Rider en route to {order.get('area', 'Kanpur')}"
    else:
        current_step = 5
        step_title = "Delivered with Sweetness ♡"
        estimated_delivery = "Delivered successfully! Enjoy the moments."
        
    order['timeline'] = {
        'current_step': current_step,
        'step_title': step_title,
        'estimated_status': estimated_delivery,
        'steps': [
            {'step': 1, 'label': 'Order Confirmed', 'time': 'Received'},
            {'step': 2, 'label': 'Baking & Icing', 'time': 'In Kitchen'},
            {'step': 3, 'label': 'Gift Box Sealed', 'time': 'Packed'},
            {'step': 4, 'label': 'Out for Delivery', 'time': 'Kanpur Rider En Route'},
            {'step': 5, 'label': 'Delivered', 'time': 'Delivered ♡'}
        ]
    }
    return order

def save_custom_inquiry(inquiry_data: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    inq_id = f"INQ-KNP-{random.randint(1000, 9999)}"
    created_at = datetime.datetime.now().isoformat()
    
    cursor.execute("""
    INSERT INTO custom_cake_inquiries (
        id, customer_name, phone, occasion, tier, flavor, theme, notes, estimated_price, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inq_id,
        inquiry_data.get('customer_name', ''),
        inquiry_data.get('phone', ''),
        inquiry_data.get('occasion', 'Celebration'),
        inquiry_data.get('tier', '1-Tier'),
        inquiry_data.get('flavor', 'Chocolate Truffle'),
        inquiry_data.get('theme', 'Floral Elegance'),
        inquiry_data.get('notes', ''),
        inquiry_data.get('estimated_price', 1499.0),
        created_at
    ))
    conn.commit()
    conn.close()
    return {'id': inq_id, 'status': 'Received', 'created_at': created_at}
