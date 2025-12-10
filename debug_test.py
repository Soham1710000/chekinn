#!/usr/bin/env python3
"""
Debug test to check notification system implementation
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

async def debug_notification_system():
    """Debug the notification system"""
    
    async with aiohttp.ClientSession() as session:
        print(f"🔗 Testing against: {API_BASE}")
        
        # Create test users
        print("\n1. Creating test users...")
        user1_data = {
            "name": "Debug User 1",
            "city": "Test City",
            "current_role": "Test Role",
            "intent": "Debug test",
            "open_to_intros": True,
            "preferred_mode": "voice"
        }
        
        user2_data = {
            "name": "Debug User 2", 
            "city": "Test City",
            "current_role": "Test Role",
            "intent": "Debug test",
            "open_to_intros": True,
            "preferred_mode": "voice"
        }
        
        async with session.post(f"{API_BASE}/users", json=user1_data) as response:
            user1 = await response.json()
            print(f"Created user1: {user1['id']}")
            
        async with session.post(f"{API_BASE}/users", json=user2_data) as response:
            user2 = await response.json()
            print(f"Created user2: {user2['id']}")
            
        # Create intro
        print("\n2. Creating intro...")
        intro_data = {
            "from_user_id": user1["id"],
            "to_user_id": user2["id"],
            "reason": "Debug test intro"
        }
        
        async with session.post(f"{API_BASE}/admin/create-intro", json=intro_data) as response:
            result = await response.json()
            print(f"Create intro result: {result}")
            
        # Get intros for user1 (from_user) - first time
        print(f"\n3. First fetch for user1 (from_user: {user1['id']})...")
        async with session.get(f"{API_BASE}/intros/{user1['id']}") as response:
            intros1_first = await response.json()
            print(f"User1 first fetch response: {json.dumps(intros1_first, indent=2)}")
            
        # Get intros for user1 again - second time
        print(f"\n4. Second fetch for user1 (from_user: {user1['id']})...")
        async with session.get(f"{API_BASE}/intros/{user1['id']}") as response:
            intros1_second = await response.json()
            print(f"User1 second fetch response: {json.dumps(intros1_second, indent=2)}")
            
        # Get intros for user2 (to_user) - first time
        print(f"\n5. First fetch for user2 (to_user: {user2['id']})...")
        async with session.get(f"{API_BASE}/intros/{user2['id']}") as response:
            intros2_first = await response.json()
            print(f"User2 first fetch response: {json.dumps(intros2_first, indent=2)}")
            
        # Get intros for user2 again - second time
        print(f"\n6. Second fetch for user2 (to_user: {user2['id']})...")
        async with session.get(f"{API_BASE}/intros/{user2['id']}") as response:
            intros2_second = await response.json()
            print(f"User2 second fetch response: {json.dumps(intros2_second, indent=2)}")

if __name__ == "__main__":
    asyncio.run(debug_notification_system())