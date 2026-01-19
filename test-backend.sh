#!/bin/bash

API_BASE="http://localhost:3000"
PASSED=0
FAILED=0

echo "======================================"
echo "Backend API Test Suite"
echo "======================================"
echo ""

test_endpoint() {
    local test_name=$1
    local expected_status=$2
    local response=$3
    local actual_status=$(echo "$response" | jq -r '.status // 0')
    
    if [ "$actual_status" -eq "$expected_status" ] 2>/dev/null || echo "$response" | grep -q "success\|_id\|data\|modifiedCount\|deletedCount" 2>/dev/null; then
        echo "✓ PASS: $test_name"
        ((PASSED++))
        return 0
    else
        echo "✗ FAIL: $test_name"
        echo "  Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "Step 1: Clear existing test data"
echo "-----------------------------------"
RESPONSE=$(curl -s -X DELETE "$API_BASE/api/test")
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo "Step 2: Run automated test suite"
echo "-----------------------------------"
RESPONSE=$(curl -s "$API_BASE/api/test")
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✓ PASS: Automated test suite"
    ((PASSED++))
else
    echo "✗ FAIL: Automated test suite"
    ((FAILED++))
fi
echo ""

echo "Step 3: Create new requests"
echo "-----------------------------------"
REQ1=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"Alice Johnson","itemRequested":"Flashlights"}')
ID1=$(echo "$REQ1" | jq -r '._id')
test_endpoint "Create request 1" 201 "$REQ1"

REQ2=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"Bob Smith","itemRequested":"First Aid Kits"}')
ID2=$(echo "$REQ2" | jq -r '._id')
test_endpoint "Create request 2" 201 "$REQ2"

REQ3=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"Carol White","itemRequested":"Blankets"}')
ID3=$(echo "$REQ3" | jq -r '._id')
test_endpoint "Create request 3" 201 "$REQ3"

REQ4=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"David Lee","itemRequested":"Canned Food"}')
ID4=$(echo "$REQ4" | jq -r '._id')
test_endpoint "Create request 4" 201 "$REQ4"

REQ5=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"Eve Martinez","itemRequested":"Water Purifiers"}')
ID5=$(echo "$REQ5" | jq -r '._id')
test_endpoint "Create request 5" 201 "$REQ5"
echo ""

echo "Step 4: Get all requests (pagination)"
echo "-----------------------------------"
RESPONSE=$(curl -s "$API_BASE/api/request?page=1")
test_endpoint "Get all requests page 1" 200 "$RESPONSE"
echo "$RESPONSE" | python3 -m json.tool | head -20
echo ""

echo "Step 5: Update single request status"
echo "-----------------------------------"
RESPONSE=$(curl -s -X PATCH "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$ID1\",\"status\":\"approved\"}")
test_endpoint "Update status to approved" 200 "$RESPONSE"
echo ""

echo "Step 6: Filter by status"
echo "-----------------------------------"
RESPONSE=$(curl -s "$API_BASE/api/request?status=approved")
test_endpoint "Filter by approved status" 200 "$RESPONSE"
echo "$RESPONSE" | python3 -m json.tool | head -20
echo ""

RESPONSE=$(curl -s "$API_BASE/api/request?status=pending")
test_endpoint "Filter by pending status" 200 "$RESPONSE"
echo ""

echo "Step 7: Batch update multiple requests"
echo "-----------------------------------"
RESPONSE=$(curl -s -X PATCH "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d "{\"ids\":[\"$ID2\",\"$ID3\"],\"status\":\"completed\"}")
test_endpoint "Batch update to completed" 200 "$RESPONSE"
echo "$RESPONSE" | python3 -m json.tool
echo ""

echo "Step 8: Batch delete requests"
echo "-----------------------------------"
RESPONSE=$(curl -s -X DELETE "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d "{\"ids\":[\"$ID4\",\"$ID5\"]}")
test_endpoint "Batch delete requests" 200 "$RESPONSE"
echo "$RESPONSE" | python3 -m json.tool
echo ""

echo "Step 9: Validation tests"
echo "-----------------------------------"

RESPONSE=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"AB","itemRequested":"Water"}')
if echo "$RESPONSE" | grep -q "Invalid input"; then
    echo "✓ PASS: Reject too short name (< 3 chars)"
    ((PASSED++))
else
    echo "✗ FAIL: Should reject too short name"
    ((FAILED++))
fi

RESPONSE=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"John Doe","itemRequested":"W"}')
if echo "$RESPONSE" | grep -q "Invalid input"; then
    echo "✓ PASS: Reject too short item (< 2 chars)"
    ((PASSED++))
else
    echo "✗ FAIL: Should reject too short item"
    ((FAILED++))
fi

RESPONSE=$(curl -s -X PATCH "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"id":"invalid","status":"approved"}')
if echo "$RESPONSE" | grep -q "Invalid input"; then
    echo "✓ PASS: Reject invalid ObjectId"
    ((PASSED++))
else
    echo "✗ FAIL: Should reject invalid ObjectId"
    ((FAILED++))
fi

RESPONSE=$(curl -s -X PATCH "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$ID1\",\"status\":\"invalid_status\"}")
if echo "$RESPONSE" | grep -q "Invalid input"; then
    echo "✓ PASS: Reject invalid status"
    ((PASSED++))
else
    echo "✗ FAIL: Should reject invalid status"
    ((FAILED++))
fi

RESPONSE=$(curl -s -X PUT "$API_BASE/api/request" \
    -H "Content-Type: application/json" \
    -d '{"requestorName":"John Doe"}')
if echo "$RESPONSE" | grep -q "Invalid input"; then
    echo "✓ PASS: Reject missing required field"
    ((PASSED++))
else
    echo "✗ FAIL: Should reject missing field"
    ((FAILED++))
fi
echo ""

echo "Step 10: Run comprehensive test suite"
echo "-----------------------------------"
RESPONSE=$(curl -s -X POST "$API_BASE/api/test")
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "✓ PASS: Comprehensive test suite"
    ((PASSED++))
else
    echo "✗ FAIL: Comprehensive test suite"
    ((FAILED++))
fi
echo ""

echo "Step 11: Final cleanup"
echo "-----------------------------------"
RESPONSE=$(curl -s -X DELETE "$API_BASE/api/test")
test_endpoint "Clear all test data" 200 "$RESPONSE"
echo ""

echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Total Passed: $PASSED"
echo "Total Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
