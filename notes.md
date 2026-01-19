# Checklist

- [x] Read the README [please please please]
- [ ] Something cool!
- [x] Back-end
  - [x] Minimum Requirements
    - [x] Setup MongoDB database
    - [x] Setup item requests collection
    - [x] `PUT /api/request`
    - [x] `GET /api/request?page=_`
  - [x] Main Requirements
    - [x] `GET /api/request?status=pending`
    - [x] `PATCH /api/request`
  - [x] Above and Beyond
    - [x] Batch edits
    - [x] Batch deletes
- [ ] Front-end
  - [ ] Minimum Requirements
    - [ ] Dropdown component
    - [ ] Table component
    - [ ] Base page [table with data]
    - [ ] Table dropdown interactivity
  - [ ] Main Requirements
    - [ ] Pagination
    - [ ] Tabs
  - [ ] Above and Beyond
    - [ ] Batch edits
    - [ ] Batch deletes

# Notes

## Backend Implementation

### Database Setup
MongoDB database "crisis_corner" with "requests" collection connected using provided credentials.

### API Endpoints

#### GET /api/request
Retrieves paginated item requests.
Query Parameters:
- page (optional): Page number (default: 1)
- status (optional): Filter by status (pending/approved/completed/rejected)

Response: { data: ItemRequest[], total: number, totalPages: number }

#### PUT /api/request
Creates a new item request.
Body: { requestorName: string, itemRequested: string }
Response: Created ItemRequest object (201)

#### PATCH /api/request
Updates request status (single or batch).

Single Edit:
Body: { id: string, status: string }
Response: Updated ItemRequest object

Batch Edit:
Body: { ids: string[], status: string }
Response: { modifiedCount: number, ids: string[] }

#### DELETE /api/request
Batch deletes requests.
Body: { ids: string[] }
Response: { deletedCount: number, ids: string[] }

### Testing

#### Executable Test Suite
Run complete automated tests:
```bash
./test-backend.sh
```
Tests all CRUD operations, pagination, filtering, batch operations, and validation.

#### API Test Endpoints

GET /api/test - Basic test suite
POST /api/test - Comprehensive test suite
DELETE /api/test - Clear all test data

### Validation
All inputs validated for:
- Requestor name: 3-30 characters
- Item requested: 2-100 characters
- Valid MongoDB ObjectIds
- Valid status values

All operations include proper error handling with appropriate HTTP status codes.
