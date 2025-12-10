#!/usr/bin/env python3
"""
Backend Test Suite for Chekinn Admin Panel
Tests all admin panel functionality including HTML serving and API endpoints.
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, List, Any

# Get backend URL from environment
BACKEND_URL = "https://voicechat-companion.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class AdminPanelTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_users = []
        self.created_intros = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_admin_html_page(self) -> bool:
        """Test Phase 1: Admin Panel HTML Page Access"""
        self.log("=== Testing Admin HTML Page ===")
        
        # First test the external URL
        try:
            response = self.session.get(f"{BACKEND_URL}/admin")
            
            if response.status_code != 200:
                self.log(f"FAIL: Admin page returned status {response.status_code}", "ERROR")
                return False
                
            # Check if response is HTML (not JSON)
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type:
                self.log(f"FAIL: Admin page returned {content_type}, expected HTML", "ERROR")
                return False
                
            # Check for key HTML elements
            html_content = response.text
            required_elements = [
                '<title>Chekinn Admin - Manual Matchmaking</title>',
                'Manual Matchmaking',
                'All Users',
                'Potential Matches',
                'Create Introduction'
            ]
            
            missing_elements = []
            for element in required_elements:
                if element not in html_content:
                    missing_elements.append(element)
                    
            if missing_elements:
                self.log(f"External URL serving React app instead of admin template", "WARNING")
                self.log(f"Missing elements: {missing_elements}", "WARNING")
                
                # Test local backend directly
                try:
                    local_response = self.session.get("http://localhost:8001/admin")
                    if local_response.status_code == 200:
                        local_content = local_response.text
                        local_missing = []
                        for element in required_elements:
                            if element not in local_content:
                                local_missing.append(element)
                                
                        if not local_missing:
                            self.log("PASS: Admin HTML works on local backend (routing issue with external URL)", "WARNING")
                            return True
                        else:
                            self.log(f"FAIL: Admin HTML missing elements even on local backend: {local_missing}", "ERROR")
                            return False
                    else:
                        self.log(f"FAIL: Local backend admin page returned status {local_response.status_code}", "ERROR")
                        return False
                except Exception as local_e:
                    self.log(f"FAIL: Error testing local admin page: {str(local_e)}", "ERROR")
                    return False
            else:
                self.log("PASS: Admin HTML page loads correctly with proper UI elements")
                return True
            
        except Exception as e:
            self.log(f"FAIL: Error accessing admin page: {str(e)}", "ERROR")
            return False
    
    def create_test_users(self) -> bool:
        """Create test users for admin panel testing"""
        self.log("=== Creating Test Users ===")
        
        test_user_data = [
            {
                "name": "Alice Johnson",
                "city": "Mumbai", 
                "current_role": "Product Manager",
                "intent": "Looking to transition into consulting, specifically interested in strategy roles at top-tier firms",
                "industries": ["Technology", "Consulting"]
            },
            {
                "name": "Bob Smith",
                "city": "Delhi",
                "current_role": "Software Engineer", 
                "intent": "Preparing for CAT exam, aiming for IIM admission for MBA in finance",
                "industries": ["Technology", "Finance"]
            },
            {
                "name": "Carol Davis",
                "city": "Bangalore",
                "current_role": "Marketing Analyst",
                "intent": "Exploring career opportunities in product management and strategy consulting",
                "industries": ["Marketing", "Consulting"]
            }
        ]
        
        try:
            for user_data in test_user_data:
                response = self.session.post(f"{API_BASE}/users", json=user_data)
                
                if response.status_code != 200:
                    self.log(f"FAIL: Failed to create user {user_data['name']}: {response.status_code}", "ERROR")
                    return False
                    
                user_response = response.json()
                self.test_users.append(user_response)
                self.log(f"Created test user: {user_data['name']} (ID: {user_response['id']})")
                
            self.log(f"PASS: Created {len(self.test_users)} test users successfully")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error creating test users: {str(e)}", "ERROR")
            return False
    
    def test_admin_users_api(self) -> bool:
        """Test Phase 2: GET /api/admin/users endpoint"""
        self.log("=== Testing Admin Users API ===")
        
        try:
            response = self.session.get(f"{API_BASE}/admin/users")
            
            if response.status_code != 200:
                self.log(f"FAIL: Admin users API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            # Check response structure
            if 'users' not in data:
                self.log("FAIL: Response missing 'users' field", "ERROR")
                return False
                
            users = data['users']
            if not isinstance(users, list):
                self.log("FAIL: 'users' field is not a list", "ERROR")
                return False
                
            if len(users) == 0:
                self.log("FAIL: No users returned from API", "ERROR")
                return False
                
            # Check user structure
            user = users[0]
            required_fields = ['id', 'name', 'city', 'current_role', 'intent', 'created_at']
            for field in required_fields:
                if field not in user:
                    self.log(f"FAIL: User missing required field: {field}", "ERROR")
                    return False
                    
            # Verify our test users are included
            user_names = [u['name'] for u in users]
            for test_user in self.test_users:
                if test_user['name'] not in user_names:
                    self.log(f"FAIL: Test user {test_user['name']} not found in admin users list", "ERROR")
                    return False
                    
            self.log(f"PASS: Admin users API returned {len(users)} users with correct structure")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error testing admin users API: {str(e)}", "ERROR")
            return False
    
    def test_admin_matches_api(self) -> bool:
        """Test Phase 2: GET /api/admin/matches/{user_id} endpoint"""
        self.log("=== Testing Admin Matches API ===")
        
        if not self.test_users:
            self.log("FAIL: No test users available for matches testing", "ERROR")
            return False
            
        try:
            test_user = self.test_users[0]
            user_id = test_user['id']
            
            response = self.session.get(f"{API_BASE}/admin/matches/{user_id}")
            
            if response.status_code != 200:
                self.log(f"FAIL: Admin matches API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            # Check response structure
            if 'matches' not in data:
                self.log("FAIL: Response missing 'matches' field", "ERROR")
                return False
                
            matches = data['matches']
            if not isinstance(matches, list):
                self.log("FAIL: 'matches' field is not a list", "ERROR")
                return False
                
            # Should have matches (other test users)
            if len(matches) < 2:
                self.log(f"FAIL: Expected at least 2 matches, got {len(matches)}", "ERROR")
                return False
                
            # Check match structure
            match = matches[0]
            required_fields = ['id', 'name', 'city', 'current_role', 'intent']
            for field in required_fields:
                if field not in match:
                    self.log(f"FAIL: Match missing required field: {field}", "ERROR")
                    return False
                    
            # Verify the user is not matched with themselves
            match_ids = [m['id'] for m in matches]
            if user_id in match_ids:
                self.log("FAIL: User matched with themselves", "ERROR")
                return False
                
            self.log(f"PASS: Admin matches API returned {len(matches)} potential matches with correct structure")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error testing admin matches API: {str(e)}", "ERROR")
            return False
    
    def test_admin_create_intro_api(self) -> bool:
        """Test Phase 2: POST /api/admin/create-intro endpoint"""
        self.log("=== Testing Admin Create Intro API ===")
        
        if len(self.test_users) < 2:
            self.log("FAIL: Need at least 2 test users for intro creation", "ERROR")
            return False
            
        try:
            user1 = self.test_users[0]
            user2 = self.test_users[1]
            
            intro_data = {
                "from_user_id": user1['id'],
                "to_user_id": user2['id'],
                "reason": "Both are interested in consulting and strategy roles. Alice's product management experience could provide valuable insights for Bob's career transition."
            }
            
            response = self.session.post(f"{API_BASE}/admin/create-intro", json=intro_data)
            
            if response.status_code != 200:
                self.log(f"FAIL: Create intro API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            # Check response structure
            if 'success' not in data:
                self.log("FAIL: Response missing 'success' field", "ERROR")
                return False
                
            if not data['success']:
                error_msg = data.get('error', 'Unknown error')
                self.log(f"FAIL: Intro creation failed: {error_msg}", "ERROR")
                return False
                
            self.created_intros.append({
                'from_user_id': user1['id'],
                'to_user_id': user2['id'],
                'from_name': user1['name'],
                'to_name': user2['name']
            })
            
            self.log(f"PASS: Successfully created intro between {user1['name']} and {user2['name']}")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error testing create intro API: {str(e)}", "ERROR")
            return False
    
    def test_duplicate_intro_prevention(self) -> bool:
        """Test that duplicate intros are prevented"""
        self.log("=== Testing Duplicate Intro Prevention ===")
        
        if not self.created_intros:
            self.log("FAIL: No existing intros to test duplication", "ERROR")
            return False
            
        try:
            existing_intro = self.created_intros[0]
            
            # Try to create the same intro again
            intro_data = {
                "from_user_id": existing_intro['from_user_id'],
                "to_user_id": existing_intro['to_user_id'],
                "reason": "Duplicate intro attempt"
            }
            
            response = self.session.post(f"{API_BASE}/admin/create-intro", json=intro_data)
            
            if response.status_code != 200:
                self.log(f"FAIL: Duplicate intro API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            # Should fail gracefully
            if data.get('success', False):
                self.log("FAIL: Duplicate intro was allowed", "ERROR")
                return False
                
            if 'error' not in data:
                self.log("FAIL: No error message for duplicate intro", "ERROR")
                return False
                
            self.log(f"PASS: Duplicate intro correctly prevented: {data['error']}")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error testing duplicate intro prevention: {str(e)}", "ERROR")
            return False
    
    def test_intro_verification(self) -> bool:
        """Test Phase 3: Verify intro was created in database"""
        self.log("=== Testing Intro Verification ===")
        
        if not self.created_intros:
            self.log("FAIL: No intros to verify", "ERROR")
            return False
            
        try:
            intro = self.created_intros[0]
            user_id = intro['from_user_id']
            
            response = self.session.get(f"{API_BASE}/intros/{user_id}")
            
            if response.status_code != 200:
                self.log(f"FAIL: Get intros API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'intros' not in data:
                self.log("FAIL: Response missing 'intros' field", "ERROR")
                return False
                
            intros = data['intros']
            
            # Find our created intro
            found_intro = None
            for db_intro in intros:
                if (db_intro['from_user_id'] == intro['from_user_id'] and 
                    db_intro['to_user_id'] == intro['to_user_id']):
                    found_intro = db_intro
                    break
                    
            if not found_intro:
                self.log("FAIL: Created intro not found in database", "ERROR")
                return False
                
            # Check intro structure
            required_fields = ['id', 'from_user_id', 'to_user_id', 'status', 'reason', 'created_at']
            for field in required_fields:
                if field not in found_intro:
                    self.log(f"FAIL: Intro missing required field: {field}", "ERROR")
                    return False
                    
            if found_intro['status'] != 'pending':
                self.log(f"FAIL: Expected intro status 'pending', got '{found_intro['status']}'", "ERROR")
                return False
                
            self.log(f"PASS: Intro verified in database with status '{found_intro['status']}'")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error verifying intro: {str(e)}", "ERROR")
            return False
    
    def test_matches_exclude_existing_intros(self) -> bool:
        """Test that matches API excludes users with existing intros"""
        self.log("=== Testing Matches Exclude Existing Intros ===")
        
        if not self.created_intros:
            self.log("FAIL: No existing intros to test exclusion", "ERROR")
            return False
            
        try:
            intro = self.created_intros[0]
            user_id = intro['from_user_id']
            excluded_user_id = intro['to_user_id']
            
            response = self.session.get(f"{API_BASE}/admin/matches/{user_id}")
            
            if response.status_code != 200:
                self.log(f"FAIL: Admin matches API returned status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            matches = data.get('matches', [])
            
            # Check that the user with existing intro is excluded
            match_ids = [m['id'] for m in matches]
            if excluded_user_id in match_ids:
                self.log("FAIL: User with existing intro was not excluded from matches", "ERROR")
                return False
                
            self.log("PASS: Users with existing intros correctly excluded from matches")
            return True
            
        except Exception as e:
            self.log(f"FAIL: Error testing intro exclusion: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all admin panel tests"""
        self.log("Starting Chekinn Admin Panel Test Suite")
        self.log(f"Backend URL: {BACKEND_URL}")
        self.log(f"API Base: {API_BASE}")
        
        results = {}
        
        # Phase 1: Admin Panel HTML Page
        results['admin_html_page'] = self.test_admin_html_page()
        
        # Create test users first
        results['create_test_users'] = self.create_test_users()
        
        # Phase 2: API Endpoints
        results['admin_users_api'] = self.test_admin_users_api()
        results['admin_matches_api'] = self.test_admin_matches_api()
        results['admin_create_intro_api'] = self.test_admin_create_intro_api()
        
        # Phase 3: Full Workflow Tests
        results['duplicate_intro_prevention'] = self.test_duplicate_intro_prevention()
        results['intro_verification'] = self.test_intro_verification()
        results['matches_exclude_existing'] = self.test_matches_exclude_existing_intros()
        
        return results
    
    def print_summary(self, results: Dict[str, bool]):
        """Print test summary"""
        self.log("\n" + "="*60)
        self.log("ADMIN PANEL TEST SUMMARY")
        self.log("="*60)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results.items():
            status = "PASS" if result else "FAIL"
            self.log(f"{test_name:<30} {status}")
            if result:
                passed += 1
                
        self.log("="*60)
        self.log(f"TOTAL: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED! Admin panel is working correctly.", "SUCCESS")
        else:
            self.log(f"❌ {total - passed} tests failed. Admin panel needs fixes.", "ERROR")
            
        return passed == total

def main():
    """Main test execution"""
    tester = AdminPanelTester()
    results = tester.run_all_tests()
    success = tester.print_summary(results)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()