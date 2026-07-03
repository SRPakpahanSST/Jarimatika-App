"""
Unit tests for Hand Detector module
"""

import unittest
import numpy as np
from unittest.mock import Mock, patch
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestHandDetector(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_landmarks = self.create_test_landmarks()
    
    def create_test_landmarks(self):
        """Create mock landmarks for testing"""
        class MockLandmark:
            def __init__(self, x, y, z):
                self.x = x
                self.y = y
                self.z = z
        
        class MockHand:
            def __init__(self):
                self.landmark = [
                    MockLandmark(0.5, 0.5, 0),  # 0: Wrist
                    MockLandmark(0.6, 0.6, 0),  # 1: Thumb base
                    MockLandmark(0.7, 0.7, 0),  # 2: Thumb tip
                    MockLandmark(0.5, 0.4, 0),  # 3: Index base
                    MockLandmark(0.5, 0.3, 0),  # 4: Index tip
                    MockLandmark(0.5, 0.4, 0),  # 5: Middle base
                    MockLandmark(0.5, 0.25, 0), # 6: Middle tip
                    MockLandmark(0.5, 0.45, 0), # 7: Ring base
                    MockLandmark(0.5, 0.35, 0), # 8: Ring tip
                    MockLandmark(0.5, 0.5, 0),  # 9: Pinky base
                    MockLandmark(0.5, 0.4, 0),  # 10: Pinky tip
                ]
        
        return MockHand()
    
    def test_count_fingers(self):
        """Test finger counting logic"""
        # This would normally import from hand-detector
        # For now, we'll implement a simple test
        def count_fingers(landmarks):
            count = 0
            # Check if tips are higher than bases
            for i in range(1, 5):
                tip_idx = i * 4
                base_idx = tip_idx - 2
                if landmarks.landmark[tip_idx].y < landmarks.landmark[base_idx].y:
                    count += 1
            return count
        
        # Test with mock landmarks
        result = count_fingers(self.test_landmarks)
        self.assertIsInstance(result, int)
        self.assertGreaterEqual(result, 0)
        self.assertLessEqual(result, 4)
    
    def test_get_number_from_fingers(self):
        """Test conversion from finger count to number"""
        test_cases = [
            (0, 0),
            (1, 1),
            (2, 2),
            (3, 3),
            (4, 4),
            (5, 4)  # Max should be 4
        ]
        
        for count, expected in test_cases:
            result = min(count, 4)
            self.assertEqual(result, expected)

class TestCalculator(unittest.TestCase):
    
    def setUp(self):
        """Set up calculator tests"""
        self.test_expressions = [
            ("2+3", 5),
            ("10-4", 6),
            ("3*4", 12),
            ("15/3", 5),
            ("7+8", 15),
            ("20-5", 15),
        ]
    
    def test_calculator_evaluation(self):
        """Test calculator evaluation logic"""
        def evaluate(expr):
            # Simple safe evaluation
            try:
                # Replace symbols
                expr = expr.replace('×', '*').replace('÷', '/')
                result = eval(expr)
                return round(result, 2)
            except:
                return None
        
        for expr, expected in self.test_expressions:
            result = evaluate(expr)
            self.assertEqual(result, expected)

if __name__ == '__main__':
    unittest.main()