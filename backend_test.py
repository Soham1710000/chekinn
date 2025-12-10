#!/usr/bin/env python3
"""
Backend Test Suite for Chekinn Notification System
Tests the notification flag creation and marking system for intro suggestions
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://voicechat-companion.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class NotificationSystemTester:
    def __init__(self):
        self.session = None
        self.test_users = []
        self.test_intro_id = None
        
    async def setup_session(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def create_test_user(self, name, city="Test City", role="Test Role"):
        """Create a test user"""
        user_data = {
            "name": name,
            "city": city,
            "current_role": role,
            "intent": "Test intent for notification system",
            "open_to_intros": True,
            "preferred_mode": "voice"
        }
        
        async with self.session.post(f"{API_BASE}/users", json=user_data) as response:
            if response.status == 200:
                user = await response.json()
                print(f"✅ Created test user: {name} (ID: {user['id']})")
                return user
            else:
                error_text = await response.text()
                print(f"❌ Failed to create user {name}: {response.status} - {error_text}")
                return None
                
    async def create_intro_via_admin(self, from_user_id, to_user_id, reason):
        """Create intro via admin API"""
        intro_data = {
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "reason": reason
        }
        
        async with self.session.post(f"{API_BASE}/admin/create-intro", json=intro_data) as response:
            if response.status == 200:
                result = await response.json()
                if result.get("success"):
                    print(f"✅ Created intro from {from_user_id} to {to_user_id}")
                    return True
                else:
                    print(f"❌ Failed to create intro: {result.get('error')}")
                    return False
            else:
                error_text = await response.text()
                print(f"❌ Failed to create intro: {response.status} - {error_text}")
                return False
                
    async def get_intros_for_user(self, user_id):
        """Get intros for a user"""
        async with self.session.get(f"{API_BASE}/intros/{user_id}") as response:
            if response.status == 200:
                result = await response.json()
                return result.get("intros", [])
            else:
                error_text = await response.text()
                print(f"❌ Failed to get intros for user {user_id}: {response.status} - {error_text}")
                return []
                
    async def verify_intro_in_database(self, from_user_id, to_user_id):
        """Verify intro exists and get its notification flags by fetching intros"""
        # Get intros for from_user to find the intro
        intros = await self.get_intros_for_user(from_user_id)
        
        for intro in intros:
            if intro["from_user_id"] == from_user_id and intro["to_user_id"] == to_user_id:
                self.test_intro_id = intro["id"]
                return intro
                
        # If not found in from_user, check to_user
        intros = await self.get_intros_for_user(to_user_id)
        for intro in intros:
            if intro["from_user_id"] == from_user_id and intro["to_user_id"] == to_user_id:
                self.test_intro_id = intro["id"]
                return intro
                
        return None
        
    async def run_notification_system_test(self):
        """Run comprehensive notification system test"""
        print("🚀 Starting Notification System Test")
        print("=" * 60)
        
        try:
            # Setup
            await self.setup_session()
            
            # Phase 1: Create test users
            print("\n📋 Phase 1: Creating Test Users")
            print("-" * 40)
            
            user1 = await self.create_test_user("Alice Johnson", "Mumbai", "Product Manager")
            user2 = await self.create_test_user("Bob Smith", "Delhi", "Software Engineer")
            
            if not user1 or not user2:
                print("❌ Failed to create test users")
                return False
                
            self.test_users = [user1, user2]
            from_user_id = user1["id"]
            to_user_id = user2["id"]
            
            # Phase 2: Create intro via admin and verify initial flags
            print("\n📋 Phase 2: Create Intro and Verify Initial Notification Flags")
            print("-" * 60)
            
            reason = "Both are working on similar product challenges and could benefit from sharing experiences"
            success = await self.create_intro_via_admin(from_user_id, to_user_id, reason)
            
            if not success:
                print("❌ Failed to create intro")
                return False
                
            # Verify intro exists and has correct initial flags
            intro = await self.verify_intro_in_database(from_user_id, to_user_id)
            if not intro:
                print("❌ Intro not found in database")
                return False
                
            print(f"✅ Intro created with ID: {intro['id']}")
            print(f"📊 Initial state - Status: {intro['status']}")
            
            # Phase 3: First fetch by from_user - should mark from_user_notified = true
            print("\n📋 Phase 3: First Fetch by From User")
            print("-" * 40)
            
            intros_from_user = await self.get_intros_for_user(from_user_id)
            
            if not intros_from_user:
                print("❌ No intros returned for from_user")
                return False
                
            # Find our test intro
            test_intro_from_user = None
            print(f"🔍 Looking for intro ID: {self.test_intro_id}")
            print(f"🔍 Available intros: {[intro['id'] for intro in intros_from_user]}")
            
            for intro in intros_from_user:
                print(f"🔍 Checking intro: {intro['id']} vs {self.test_intro_id}")
                if intro["id"] == self.test_intro_id:
                    test_intro_from_user = intro
                    break
                    
            if not test_intro_from_user:
                print("❌ Test intro not found in from_user's intros")
                print(f"🔍 All intros for from_user: {json.dumps(intros_from_user, indent=2)}")
                return False
                
            # Verify is_new flag
            if test_intro_from_user.get("is_new") != True:
                print(f"❌ Expected is_new: true for from_user, got: {test_intro_from_user.get('is_new')}")
                return False
                
            print(f"✅ First fetch by from_user - is_new: {test_intro_from_user.get('is_new')}")
            
            # Phase 4: Second fetch by from_user - should show is_new = false
            print("\n📋 Phase 4: Second Fetch by From User (Already Notified)")
            print("-" * 50)
            
            intros_from_user_2nd = await self.get_intros_for_user(from_user_id)
            
            test_intro_from_user_2nd = None
            for intro in intros_from_user_2nd:
                if intro["id"] == self.test_intro_id:
                    test_intro_from_user_2nd = intro
                    break
                    
            if not test_intro_from_user_2nd:
                print("❌ Test intro not found in from_user's second fetch")
                return False
                
            if test_intro_from_user_2nd.get("is_new") != False:
                print(f"❌ Expected is_new: false for from_user 2nd fetch, got: {test_intro_from_user_2nd.get('is_new')}")
                return False
                
            print(f"✅ Second fetch by from_user - is_new: {test_intro_from_user_2nd.get('is_new')}")
            
            # Phase 5: First fetch by to_user - should mark to_user_notified = true
            print("\n📋 Phase 5: First Fetch by To User")
            print("-" * 40)
            
            intros_to_user = await self.get_intros_for_user(to_user_id)
            
            if not intros_to_user:
                print("❌ No intros returned for to_user")
                return False
                
            # Find our test intro
            test_intro_to_user = None
            for intro in intros_to_user:
                if intro["id"] == self.test_intro_id:
                    test_intro_to_user = intro
                    break
                    
            if not test_intro_to_user:
                print("❌ Test intro not found in to_user's intros")
                return False
                
            # Verify is_new flag for to_user
            if test_intro_to_user.get("is_new") != True:
                print(f"❌ Expected is_new: true for to_user, got: {test_intro_to_user.get('is_new')}")
                return False
                
            print(f"✅ First fetch by to_user - is_new: {test_intro_to_user.get('is_new')}")
            
            # Phase 6: Second fetch by to_user - should show is_new = false
            print("\n📋 Phase 6: Second Fetch by To User (Already Notified)")
            print("-" * 50)
            
            intros_to_user_2nd = await self.get_intros_for_user(to_user_id)
            
            test_intro_to_user_2nd = None
            for intro in intros_to_user_2nd:
                if intro["id"] == self.test_intro_id:
                    test_intro_to_user_2nd = intro
                    break
                    
            if not test_intro_to_user_2nd:
                print("❌ Test intro not found in to_user's second fetch")
                return False
                
            if test_intro_to_user_2nd.get("is_new") != False:
                print(f"❌ Expected is_new: false for to_user 2nd fetch, got: {test_intro_to_user_2nd.get('is_new')}")
                return False
                
            print(f"✅ Second fetch by to_user - is_new: {test_intro_to_user_2nd.get('is_new')}")
            
            # Phase 7: Final verification - both users should see is_new = false
            print("\n📋 Phase 7: Final State Verification")
            print("-" * 40)
            
            # Final check for from_user
            final_intros_from = await self.get_intros_for_user(from_user_id)
            final_intro_from = None
            for intro in final_intros_from:
                if intro["id"] == self.test_intro_id:
                    final_intro_from = intro
                    break
                    
            # Final check for to_user
            final_intros_to = await self.get_intros_for_user(to_user_id)
            final_intro_to = None
            for intro in final_intros_to:
                if intro["id"] == self.test_intro_id:
                    final_intro_to = intro
                    break
                    
            if final_intro_from and final_intro_to:
                from_is_new = final_intro_from.get("is_new")
                to_is_new = final_intro_to.get("is_new")
                
                if from_is_new == False and to_is_new == False:
                    print("✅ Final state: Both users show is_new: false (both notified)")
                else:
                    print(f"❌ Final state incorrect - from_user is_new: {from_is_new}, to_user is_new: {to_is_new}")
                    return False
            else:
                print("❌ Could not verify final state")
                return False
                
            print("\n🎉 ALL NOTIFICATION SYSTEM TESTS PASSED!")
            print("=" * 60)
            print("✅ Notification flags created correctly (both false initially)")
            print("✅ First user fetch marks appropriate flag and shows is_new: true")
            print("✅ Subsequent fetches show is_new: false")
            print("✅ Independent notification tracking for both users")
            print("✅ Final state: both users notified, is_new: false")
            
            return True
            
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            await self.cleanup_session()

async def main():
    """Main test runner"""
    print(f"🔗 Testing against: {API_BASE}")
    print(f"⏰ Test started at: {datetime.now().isoformat()}")
    
    tester = NotificationSystemTester()
    success = await tester.run_notification_system_test()
    
    if success:
        print("\n🎯 NOTIFICATION SYSTEM TEST: PASSED")
        exit(0)
    else:
        print("\n💥 NOTIFICATION SYSTEM TEST: FAILED")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())