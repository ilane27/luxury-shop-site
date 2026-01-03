import requests
import sys
import json
from datetime import datetime

class LuxuryShopAPITester:
    def __init__(self, base_url="https://luxury-shop-19.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_credentials = {"username": "LuxuryShop76K", "password": "Amiche2710"}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_database_init(self):
        """Initialize database with sample data"""
        print("\n=== DATABASE INITIALIZATION ===")
        success, response = self.run_test("Database Init", "POST", "init", 200)
        return success

    def test_public_endpoints(self):
        """Test public endpoints"""
        print("\n=== PUBLIC ENDPOINTS TESTS ===")
        
        # Settings
        success, settings = self.run_test("Get Settings", "GET", "settings", 200)
        
        # Categories
        success, categories = self.run_test("Get Categories", "GET", "categories", 200)
        if success and categories:
            print(f"   Found {len(categories)} categories")
            if categories:
                category_id = categories[0]['id']
                self.run_test("Get Category by Slug", "GET", f"categories/{categories[0]['slug']}", 200)
        
        # Products
        success, products = self.run_test("Get All Products", "GET", "products", 200)
        if success and products:
            print(f"   Found {len(products)} products")
            # Test featured products
            self.run_test("Get Featured Products", "GET", "products?featured=true", 200)
            # Test product search
            self.run_test("Search Products", "GET", "products?search=maillot", 200)
            # Test category filter
            if categories:
                self.run_test("Filter by Category", "GET", f"products?category={categories[0]['id']}", 200)
            # Test individual product
            if products:
                product_id = products[0]['id']
                self.run_test("Get Product by ID", "GET", f"products/{product_id}", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n=== CONTACT FORM TEST ===")
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from automated testing."
        }
        self.run_test("Submit Contact Form", "POST", "contact", 200, contact_data)

    def test_visit_tracking(self):
        """Test visit tracking"""
        print("\n=== VISIT TRACKING TEST ===")
        self.run_test("Track Visit", "POST", "visit?page=home", 200)

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n=== ADMIN AUTHENTICATION ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            self.admin_credentials
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            # Test protected endpoint
            self.run_test("Get Admin Profile", "GET", "admin/me", 200)
            return True
        return False

    def test_admin_stats(self):
        """Test admin statistics"""
        print("\n=== ADMIN STATISTICS ===")
        if not self.token:
            print("❌ No admin token available")
            return False
        
        success, stats = self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        if success:
            print(f"   Total Orders: {stats.get('total_orders', 0)}")
            print(f"   Total Products: {stats.get('total_products', 0)}")
            print(f"   Total Revenue: {stats.get('total_revenue', 0)}€")
        return success

    def test_admin_products(self):
        """Test admin product management"""
        print("\n=== ADMIN PRODUCT MANAGEMENT ===")
        if not self.token:
            print("❌ No admin token available")
            return False

        # Get all products (admin view)
        success, products = self.run_test("Admin Get Products", "GET", "admin/products", 200)
        
        # Test creating a new product (need category first)
        success, categories = self.run_test("Get Categories for Product", "GET", "categories", 200)
        if success and categories:
            test_product = {
                "name": "Test Product",
                "slug": "test-product",
                "description": "A test product for automated testing",
                "price": 99.99,
                "images": ["https://images.pexels.com/photos/1755288/pexels-photo-1755288.jpeg"],
                "category_id": categories[0]['id'],
                "sizes": ["M", "L"],
                "colors": ["Black", "White"],
                "brand": "Test Brand",
                "stock": 10,
                "featured": False,
                "active": True
            }
            success, created_product = self.run_test("Create Product", "POST", "admin/products", 200, test_product)
            
            if success and 'id' in created_product:
                product_id = created_product['id']
                print(f"   Created product ID: {product_id}")
                
                # Test updating the product
                update_data = {"price": 89.99, "stock": 15}
                self.run_test("Update Product", "PUT", f"admin/products/{product_id}", 200, update_data)
                
                # Test deleting the product
                self.run_test("Delete Product", "DELETE", f"admin/products/{product_id}", 200)

    def test_admin_orders(self):
        """Test admin order management"""
        print("\n=== ADMIN ORDER MANAGEMENT ===")
        if not self.token:
            print("❌ No admin token available")
            return False

        success, orders = self.run_test("Admin Get Orders", "GET", "admin/orders", 200)
        if success:
            print(f"   Found {len(orders)} orders")

    def test_order_creation(self):
        """Test order creation flow"""
        print("\n=== ORDER CREATION TEST ===")
        
        # Get products first
        success, products = self.run_test("Get Products for Order", "GET", "products?limit=1", 200)
        if not success or not products:
            print("❌ No products available for order test")
            return False

        product = products[0]
        order_data = {
            "items": [{
                "product_id": product['id'],
                "quantity": 1,
                "size": product.get('sizes', [None])[0] if product.get('sizes') else None,
                "color": product.get('colors', [None])[0] if product.get('colors') else None
            }],
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+33123456789",
            "shipping_address": "123 Test Street",
            "shipping_city": "Paris",
            "shipping_postal": "75001",
            "payment_method": "bank",
            "notes": "Test order from automated testing"
        }
        
        success, order_response = self.run_test("Create Order", "POST", "orders", 200, order_data)
        if success and 'order_id' in order_response:
            order_id = order_response['order_id']
            print(f"   Created order ID: {order_id}")
            
            # Test getting the order
            self.run_test("Get Order by ID", "GET", f"orders/{order_id}", 200)
            return order_id
        return None

    def test_stripe_payment_flow(self):
        """Test Stripe payment creation (without actual payment)"""
        print("\n=== STRIPE PAYMENT FLOW TEST ===")
        
        # Get products first
        success, products = self.run_test("Get Products for Stripe", "GET", "products?limit=1", 200)
        if not success or not products:
            print("❌ No products available for Stripe test")
            return False

        product = products[0]
        order_data = {
            "items": [{
                "product_id": product['id'],
                "quantity": 1,
                "size": product.get('sizes', [None])[0] if product.get('sizes') else None,
                "color": product.get('colors', [None])[0] if product.get('colors') else None
            }],
            "customer_name": "Stripe Test Customer",
            "customer_email": "stripe@example.com",
            "customer_phone": "+33123456789",
            "shipping_address": "123 Stripe Street",
            "shipping_city": "Paris",
            "shipping_postal": "75001",
            "payment_method": "card",
            "notes": "Stripe test order"
        }
        
        # Add Origin header for Stripe
        headers = {'Origin': 'https://luxury-shop-19.preview.emergentagent.com'}
        success, order_response = self.run_test("Create Stripe Order", "POST", "orders", 200, order_data, headers)
        if success and 'checkout_url' in order_response:
            print(f"   Stripe checkout URL created: {order_response['checkout_url'][:50]}...")
            return True
        return False

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting LUXURYSHOP76K API Tests")
        print("=" * 50)
        
        # Basic health checks
        self.test_health_check()
        
        # Initialize database
        if not self.test_database_init():
            print("❌ Database initialization failed - stopping tests")
            return False
        
        # Public endpoints
        self.test_public_endpoints()
        self.test_contact_form()
        self.test_visit_tracking()
        
        # Admin authentication
        if self.test_admin_login():
            self.test_admin_stats()
            self.test_admin_products()
            self.test_admin_orders()
        
        # Order creation
        self.test_order_creation()
        self.test_stripe_payment_flow()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 FINAL RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test.get('test', 'Unknown')}: {test.get('error', test.get('response', 'Unknown error'))}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = LuxuryShopAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())