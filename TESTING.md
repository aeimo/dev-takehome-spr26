# Backend API Testing Guide

## Prerequisites
Server running at http://localhost:3000

## Quick Start - Executable Test Suite

Run the complete automated test suite with a single command:

```bash
./test-backend.sh
```

This script will:
- Clear existing test data
- Run automated test suites
- Create multiple test requests
- Test pagination and filtering
- Test single and batch status updates
- Test batch deletions
- Validate input constraints
- Display pass/fail results for each test
- Show final summary with total passed/failed tests

Expected output: "All tests passed!" with 19 tests passing and 0 failures.