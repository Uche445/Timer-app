#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Power Timer App
Tests all timer CRUD operations, templates, and statistics endpoints
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

# Backend URL from environment
BACKEND_URL = "https://2c20541d-b61d-4b69-a8bd-e0d09e5adea2.preview.emergentagent.com/api"

class PowerTimerAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.created_timers = []
        self.created_templates = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_api_health(self) -> bool:
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log("✅ API health check passed")
                return True
            else:
                self.log(f"❌ API health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ API connection failed: {str(e)}", "ERROR")
            return False
    
    def test_timer_crud_operations(self) -> Dict[str, bool]:
        """Test all timer CRUD operations"""
        results = {}
        
        # Test 1: Create Timer
        self.log("Testing Timer Creation...")
        timer_data = {
            "name": "Focus Session",
            "duration_seconds": 1500,  # 25 minutes
            "category": "productivity"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/timers", json=timer_data)
            if response.status_code == 200:
                timer = response.json()
                self.created_timers.append(timer['id'])
                
                # Validate timer structure
                required_fields = ['id', 'name', 'duration_seconds', 'remaining_seconds', 'status', 'created_at', 'category']
                if all(field in timer for field in required_fields):
                    if timer['remaining_seconds'] == timer['duration_seconds'] and timer['status'] == 'stopped':
                        self.log("✅ Timer creation successful")
                        results['create_timer'] = True
                    else:
                        self.log("❌ Timer creation - invalid initial state", "ERROR")
                        results['create_timer'] = False
                else:
                    self.log("❌ Timer creation - missing required fields", "ERROR")
                    results['create_timer'] = False
            else:
                self.log(f"❌ Timer creation failed: {response.status_code} - {response.text}", "ERROR")
                results['create_timer'] = False
        except Exception as e:
            self.log(f"❌ Timer creation error: {str(e)}", "ERROR")
            results['create_timer'] = False
        
        # Test 2: Get All Timers
        self.log("Testing Get All Timers...")
        try:
            response = self.session.get(f"{self.base_url}/timers")
            if response.status_code == 200:
                timers = response.json()
                if isinstance(timers, list) and len(timers) > 0:
                    self.log(f"✅ Retrieved {len(timers)} timers")
                    results['get_timers'] = True
                else:
                    self.log("❌ No timers retrieved", "ERROR")
                    results['get_timers'] = False
            else:
                self.log(f"❌ Get timers failed: {response.status_code}", "ERROR")
                results['get_timers'] = False
        except Exception as e:
            self.log(f"❌ Get timers error: {str(e)}", "ERROR")
            results['get_timers'] = False
        
        # Test 3: Get Specific Timer
        if self.created_timers:
            timer_id = self.created_timers[0]
            self.log(f"Testing Get Specific Timer: {timer_id}")
            try:
                response = self.session.get(f"{self.base_url}/timers/{timer_id}")
                if response.status_code == 200:
                    timer = response.json()
                    if timer['id'] == timer_id:
                        self.log("✅ Get specific timer successful")
                        results['get_specific_timer'] = True
                    else:
                        self.log("❌ Get specific timer - ID mismatch", "ERROR")
                        results['get_specific_timer'] = False
                else:
                    self.log(f"❌ Get specific timer failed: {response.status_code}", "ERROR")
                    results['get_specific_timer'] = False
            except Exception as e:
                self.log(f"❌ Get specific timer error: {str(e)}", "ERROR")
                results['get_specific_timer'] = False
        
        # Test 4: Update Timer Status (Start)
        if self.created_timers:
            timer_id = self.created_timers[0]
            self.log("Testing Timer Status Update - Start...")
            try:
                update_data = {"status": "running"}
                response = self.session.patch(f"{self.base_url}/timers/{timer_id}", json=update_data)
                if response.status_code == 200:
                    timer = response.json()
                    if timer['status'] == 'running' and timer['started_at'] is not None:
                        self.log("✅ Timer start successful")
                        results['start_timer'] = True
                    else:
                        self.log("❌ Timer start - status not updated properly", "ERROR")
                        results['start_timer'] = False
                else:
                    self.log(f"❌ Timer start failed: {response.status_code}", "ERROR")
                    results['start_timer'] = False
            except Exception as e:
                self.log(f"❌ Timer start error: {str(e)}", "ERROR")
                results['start_timer'] = False
        
        # Test 5: Update Timer Status (Pause)
        if self.created_timers:
            timer_id = self.created_timers[0]
            self.log("Testing Timer Status Update - Pause...")
            try:
                update_data = {"status": "paused"}
                response = self.session.patch(f"{self.base_url}/timers/{timer_id}", json=update_data)
                if response.status_code == 200:
                    timer = response.json()
                    if timer['status'] == 'paused' and timer['paused_at'] is not None:
                        self.log("✅ Timer pause successful")
                        results['pause_timer'] = True
                    else:
                        self.log("❌ Timer pause - status not updated properly", "ERROR")
                        results['pause_timer'] = False
                else:
                    self.log(f"❌ Timer pause failed: {response.status_code}", "ERROR")
                    results['pause_timer'] = False
            except Exception as e:
                self.log(f"❌ Timer pause error: {str(e)}", "ERROR")
                results['pause_timer'] = False
        
        # Test 6: Update Timer Status (Complete)
        if self.created_timers:
            timer_id = self.created_timers[0]
            self.log("Testing Timer Status Update - Complete...")
            try:
                update_data = {"status": "completed"}
                response = self.session.patch(f"{self.base_url}/timers/{timer_id}", json=update_data)
                if response.status_code == 200:
                    timer = response.json()
                    if timer['status'] == 'completed' and timer['completed_at'] is not None:
                        self.log("✅ Timer completion successful")
                        results['complete_timer'] = True
                    else:
                        self.log("❌ Timer completion - status not updated properly", "ERROR")
                        results['complete_timer'] = False
                else:
                    self.log(f"❌ Timer completion failed: {response.status_code}", "ERROR")
                    results['complete_timer'] = False
            except Exception as e:
                self.log(f"❌ Timer completion error: {str(e)}", "ERROR")
                results['complete_timer'] = False
        
        # Test 7: Update Remaining Seconds
        # Create a new timer for this test
        self.log("Testing Remaining Seconds Update...")
        try:
            timer_data = {
                "name": "Test Timer for Seconds",
                "duration_seconds": 600,
                "category": "test"
            }
            response = self.session.post(f"{self.base_url}/timers", json=timer_data)
            if response.status_code == 200:
                timer = response.json()
                timer_id = timer['id']
                self.created_timers.append(timer_id)
                
                # Update remaining seconds
                update_data = {"remaining_seconds": 300}
                response = self.session.patch(f"{self.base_url}/timers/{timer_id}", json=update_data)
                if response.status_code == 200:
                    updated_timer = response.json()
                    if updated_timer['remaining_seconds'] == 300:
                        self.log("✅ Remaining seconds update successful")
                        results['update_remaining_seconds'] = True
                    else:
                        self.log("❌ Remaining seconds not updated properly", "ERROR")
                        results['update_remaining_seconds'] = False
                else:
                    self.log(f"❌ Remaining seconds update failed: {response.status_code}", "ERROR")
                    results['update_remaining_seconds'] = False
            else:
                self.log("❌ Could not create timer for seconds test", "ERROR")
                results['update_remaining_seconds'] = False
        except Exception as e:
            self.log(f"❌ Remaining seconds update error: {str(e)}", "ERROR")
            results['update_remaining_seconds'] = False
        
        # Test 8: Delete Timer
        if len(self.created_timers) > 1:
            timer_id = self.created_timers[-1]  # Delete the last created timer
            self.log(f"Testing Timer Deletion: {timer_id}")
            try:
                response = self.session.delete(f"{self.base_url}/timers/{timer_id}")
                if response.status_code == 200:
                    # Verify deletion
                    verify_response = self.session.get(f"{self.base_url}/timers/{timer_id}")
                    if verify_response.status_code == 404:
                        self.log("✅ Timer deletion successful")
                        results['delete_timer'] = True
                        self.created_timers.remove(timer_id)
                    else:
                        self.log("❌ Timer deletion - timer still exists", "ERROR")
                        results['delete_timer'] = False
                else:
                    self.log(f"❌ Timer deletion failed: {response.status_code}", "ERROR")
                    results['delete_timer'] = False
            except Exception as e:
                self.log(f"❌ Timer deletion error: {str(e)}", "ERROR")
                results['delete_timer'] = False
        
        return results
    
    def test_timer_templates(self) -> Dict[str, bool]:
        """Test timer template operations"""
        results = {}
        
        # Test 1: Initialize Default Templates
        self.log("Testing Initialize Default Templates...")
        try:
            response = self.session.post(f"{self.base_url}/init-templates")
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Default templates initialized: {result['message']}")
                results['init_templates'] = True
            else:
                self.log(f"❌ Initialize templates failed: {response.status_code}", "ERROR")
                results['init_templates'] = False
        except Exception as e:
            self.log(f"❌ Initialize templates error: {str(e)}", "ERROR")
            results['init_templates'] = False
        
        # Test 2: Get All Templates
        self.log("Testing Get All Templates...")
        try:
            response = self.session.get(f"{self.base_url}/templates")
            if response.status_code == 200:
                templates = response.json()
                if isinstance(templates, list) and len(templates) > 0:
                    self.log(f"✅ Retrieved {len(templates)} templates")
                    results['get_templates'] = True
                    
                    # Store template IDs for further testing
                    self.created_templates = [t['id'] for t in templates]
                    
                    # Validate template structure
                    template = templates[0]
                    required_fields = ['id', 'name', 'duration_minutes', 'description', 'category']
                    if all(field in template for field in required_fields):
                        self.log("✅ Template structure validation passed")
                    else:
                        self.log("❌ Template missing required fields", "ERROR")
                else:
                    self.log("❌ No templates retrieved", "ERROR")
                    results['get_templates'] = False
            else:
                self.log(f"❌ Get templates failed: {response.status_code}", "ERROR")
                results['get_templates'] = False
        except Exception as e:
            self.log(f"❌ Get templates error: {str(e)}", "ERROR")
            results['get_templates'] = False
        
        # Test 3: Create Timer from Template
        if self.created_templates:
            template_id = self.created_templates[0]
            self.log(f"Testing Create Timer from Template: {template_id}")
            try:
                response = self.session.post(f"{self.base_url}/templates/{template_id}/create-timer")
                if response.status_code == 200:
                    timer = response.json()
                    if timer['template_id'] == template_id:
                        self.log("✅ Timer created from template successfully")
                        results['create_timer_from_template'] = True
                        self.created_timers.append(timer['id'])
                    else:
                        self.log("❌ Timer from template - template_id mismatch", "ERROR")
                        results['create_timer_from_template'] = False
                else:
                    self.log(f"❌ Create timer from template failed: {response.status_code}", "ERROR")
                    results['create_timer_from_template'] = False
            except Exception as e:
                self.log(f"❌ Create timer from template error: {str(e)}", "ERROR")
                results['create_timer_from_template'] = False
        
        # Test 4: Create Timer from Template with Custom Name
        if self.created_templates:
            template_id = self.created_templates[0]
            custom_name = "My Custom Focus Session"
            self.log(f"Testing Create Timer from Template with Custom Name...")
            try:
                response = self.session.post(f"{self.base_url}/templates/{template_id}/create-timer?name={custom_name}")
                if response.status_code == 200:
                    timer = response.json()
                    if timer['name'] == custom_name and timer['template_id'] == template_id:
                        self.log("✅ Timer created from template with custom name successfully")
                        results['create_timer_from_template_custom_name'] = True
                        self.created_timers.append(timer['id'])
                    else:
                        self.log("❌ Timer from template with custom name - validation failed", "ERROR")
                        results['create_timer_from_template_custom_name'] = False
                else:
                    self.log(f"❌ Create timer from template with custom name failed: {response.status_code}", "ERROR")
                    results['create_timer_from_template_custom_name'] = False
            except Exception as e:
                self.log(f"❌ Create timer from template with custom name error: {str(e)}", "ERROR")
                results['create_timer_from_template_custom_name'] = False
        
        return results
    
    def test_statistics(self) -> Dict[str, bool]:
        """Test statistics endpoint"""
        results = {}
        
        self.log("Testing Statistics API...")
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ['total_sessions', 'total_time_seconds', 'categories', 
                                 'today_sessions', 'today_time_seconds', 'average_session_duration']
                
                if all(field in stats for field in required_fields):
                    self.log("✅ Statistics API successful")
                    self.log(f"   Total Sessions: {stats['total_sessions']}")
                    self.log(f"   Total Time: {stats['total_time_seconds']} seconds")
                    self.log(f"   Categories: {stats['categories']}")
                    self.log(f"   Today Sessions: {stats['today_sessions']}")
                    results['get_stats'] = True
                else:
                    self.log("❌ Statistics API - missing required fields", "ERROR")
                    results['get_stats'] = False
            else:
                self.log(f"❌ Statistics API failed: {response.status_code}", "ERROR")
                results['get_stats'] = False
        except Exception as e:
            self.log(f"❌ Statistics API error: {str(e)}", "ERROR")
            results['get_stats'] = False
        
        return results
    
    def test_edge_cases(self) -> Dict[str, bool]:
        """Test edge cases and error handling"""
        results = {}
        
        # Test 1: Invalid Timer ID
        self.log("Testing Invalid Timer ID...")
        try:
            response = self.session.get(f"{self.base_url}/timers/invalid-id")
            if response.status_code == 404:
                self.log("✅ Invalid timer ID handled correctly")
                results['invalid_timer_id'] = True
            else:
                self.log(f"❌ Invalid timer ID not handled properly: {response.status_code}", "ERROR")
                results['invalid_timer_id'] = False
        except Exception as e:
            self.log(f"❌ Invalid timer ID test error: {str(e)}", "ERROR")
            results['invalid_timer_id'] = False
        
        # Test 2: Invalid Template ID
        self.log("Testing Invalid Template ID...")
        try:
            response = self.session.post(f"{self.base_url}/templates/invalid-id/create-timer")
            if response.status_code == 404:
                self.log("✅ Invalid template ID handled correctly")
                results['invalid_template_id'] = True
            else:
                self.log(f"❌ Invalid template ID not handled properly: {response.status_code}", "ERROR")
                results['invalid_template_id'] = False
        except Exception as e:
            self.log(f"❌ Invalid template ID test error: {str(e)}", "ERROR")
            results['invalid_template_id'] = False
        
        # Test 3: Zero Duration Timer
        self.log("Testing Zero Duration Timer...")
        try:
            timer_data = {
                "name": "Zero Duration Timer",
                "duration_seconds": 0,
                "category": "test"
            }
            response = self.session.post(f"{self.base_url}/timers", json=timer_data)
            if response.status_code == 200:
                timer = response.json()
                if timer['duration_seconds'] == 0 and timer['remaining_seconds'] == 0:
                    self.log("✅ Zero duration timer created successfully")
                    results['zero_duration_timer'] = True
                    self.created_timers.append(timer['id'])
                else:
                    self.log("❌ Zero duration timer - invalid state", "ERROR")
                    results['zero_duration_timer'] = False
            else:
                self.log(f"❌ Zero duration timer creation failed: {response.status_code}", "ERROR")
                results['zero_duration_timer'] = False
        except Exception as e:
            self.log(f"❌ Zero duration timer test error: {str(e)}", "ERROR")
            results['zero_duration_timer'] = False
        
        # Test 4: Missing Required Fields
        self.log("Testing Missing Required Fields...")
        try:
            timer_data = {
                "name": "Incomplete Timer"
                # Missing duration_seconds
            }
            response = self.session.post(f"{self.base_url}/timers", json=timer_data)
            if response.status_code == 422:  # Validation error
                self.log("✅ Missing required fields handled correctly")
                results['missing_required_fields'] = True
            else:
                self.log(f"❌ Missing required fields not handled properly: {response.status_code}", "ERROR")
                results['missing_required_fields'] = False
        except Exception as e:
            self.log(f"❌ Missing required fields test error: {str(e)}", "ERROR")
            results['missing_required_fields'] = False
        
        return results
    
    def cleanup(self):
        """Clean up created test data"""
        self.log("Cleaning up test data...")
        for timer_id in self.created_timers:
            try:
                self.session.delete(f"{self.base_url}/timers/{timer_id}")
            except:
                pass
        self.log("Cleanup completed")
    
    def run_all_tests(self) -> Dict[str, Dict[str, bool]]:
        """Run all backend tests"""
        self.log("=" * 60)
        self.log("STARTING POWER TIMER BACKEND API TESTS")
        self.log("=" * 60)
        
        all_results = {}
        
        # Test API Health
        if not self.test_api_health():
            self.log("❌ API health check failed - aborting tests", "ERROR")
            return {"error": {"api_health": False}}
        
        # Run all test suites
        all_results['timer_crud'] = self.test_timer_crud_operations()
        all_results['templates'] = self.test_timer_templates()
        all_results['statistics'] = self.test_statistics()
        all_results['edge_cases'] = self.test_edge_cases()
        
        # Cleanup
        self.cleanup()
        
        # Summary
        self.log("=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        total_tests = 0
        passed_tests = 0
        
        for suite_name, suite_results in all_results.items():
            self.log(f"\n{suite_name.upper()}:")
            for test_name, result in suite_results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                self.log(f"  {test_name}: {status}")
                total_tests += 1
                if result:
                    passed_tests += 1
        
        self.log(f"\nOVERALL: {passed_tests}/{total_tests} tests passed")
        self.log("=" * 60)
        
        return all_results


def main():
    """Main test execution"""
    tester = PowerTimerAPITester()
    results = tester.run_all_tests()
    
    # Return exit code based on results
    if 'error' in results:
        return 1
    
    # Check if all tests passed
    all_passed = True
    for suite_results in results.values():
        for result in suite_results.values():
            if not result:
                all_passed = False
                break
        if not all_passed:
            break
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    exit(main())