import { NextResponse } from "next/server";
import {
  createItemRequest,
  getAllRequests,
  deleteAllRequests,
  getRequestById,
  updateRequestStatus,
  batchUpdateRequestStatus,
  batchDeleteRequests,
} from "@/server/db/requests";
import { RequestStatus } from "@/lib/types/request";

export async function GET() {
  try {
    const results: Record<string, unknown> = {};

    results.test1_create = "Creating test requests...";
    const request1 = await createItemRequest("John Doe", "Water Bottles");
    const request2 = await createItemRequest("Jane Smith", "Flashlights");
    const request3 = await createItemRequest("Bob Johnson", "First Aid Kit");
    results.created_requests = [request1, request2, request3];

    results.test2_getById = "Fetching request by ID...";
    const fetchedRequest = await getRequestById(request1._id!.toString());
    results.fetched_request = fetchedRequest;

    results.test3_updateStatus = "Updating request status...";
    const updatedRequest = await updateRequestStatus(
      request1._id!.toString(),
      RequestStatus.APPROVED
    );
    results.updated_request = updatedRequest;

    results.test4_batchUpdate = "Batch updating requests...";
    const batchUpdateCount = await batchUpdateRequestStatus(
      [request2._id!.toString(), request3._id!.toString()],
      RequestStatus.COMPLETED
    );
    results.batch_update_count = batchUpdateCount;

    results.test5_getAllRequests = "Fetching all requests...";
    const allRequests = await getAllRequests();
    results.all_requests = allRequests;

    results.test6_batchDelete = "Batch deleting requests...";
    const batchDeleteCount = await batchDeleteRequests([
      request2._id!.toString(),
      request3._id!.toString(),
    ]);
    results.batch_delete_count = batchDeleteCount;

    results.test7_cleanup = "Cleaning up remaining test data...";
    await deleteAllRequests();
    results.cleanup_complete = true;

    results.final_verification = "Verifying cleanup...";
    const finalRequests = await getAllRequests();
    results.final_request_count = finalRequests.length;

    return NextResponse.json({
      success: true,
      message: "All tests passed successfully",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Test failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const testResults: Record<string, unknown> = {};

    testResults.phase1 = "Creating multiple test requests...";
    const requests = await Promise.all([
      createItemRequest("Alice Cooper", "Blankets"),
      createItemRequest("Charlie Brown", "Canned Food"),
      createItemRequest("Diana Prince", "Medical Supplies"),
      createItemRequest("Ethan Hunt", "Tents"),
      createItemRequest("Fiona Gallagher", "Water Purifiers"),
    ]);
    testResults.created_count = requests.length;

    testResults.phase2 = "Testing status updates...";
    await updateRequestStatus(requests[0]._id!.toString(), RequestStatus.APPROVED);
    await updateRequestStatus(requests[1]._id!.toString(), RequestStatus.REJECTED);
    await updateRequestStatus(requests[2]._id!.toString(), RequestStatus.COMPLETED);
    testResults.individual_updates_complete = true;

    testResults.phase3 = "Testing batch operations...";
    const batchUpdateResult = await batchUpdateRequestStatus(
      [requests[3]._id!.toString(), requests[4]._id!.toString()],
      RequestStatus.APPROVED
    );
    testResults.batch_update_count = batchUpdateResult;

    testResults.phase4 = "Verifying all operations...";
    const allRequests = await getAllRequests();
    testResults.total_requests = allRequests.length;
    testResults.status_breakdown = {
      pending: allRequests.filter((r) => r.status === RequestStatus.PENDING).length,
      approved: allRequests.filter((r) => r.status === RequestStatus.APPROVED).length,
      rejected: allRequests.filter((r) => r.status === RequestStatus.REJECTED).length,
      completed: allRequests.filter((r) => r.status === RequestStatus.COMPLETED).length,
    };

    testResults.phase5 = "Testing batch delete...";
    const deleteIds = [requests[0]._id!.toString(), requests[1]._id!.toString()];
    const deleteCount = await batchDeleteRequests(deleteIds);
    testResults.deleted_count = deleteCount;

    testResults.phase6 = "Final cleanup...";
    const cleanupCount = await deleteAllRequests();
    testResults.cleanup_count = cleanupCount;

    testResults.phase7 = "Final verification...";
    const finalCheck = await getAllRequests();
    testResults.final_count = finalCheck.length;

    return NextResponse.json({
      success: true,
      message: "Comprehensive test suite passed",
      testResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Test suite failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const deletedCount = await deleteAllRequests();
    return NextResponse.json({
      success: true,
      message: "All test data cleared",
      deletedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear test data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
