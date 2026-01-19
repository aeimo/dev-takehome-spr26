import { ResponseType } from "@/lib/types/apiResponse";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import {
  createItemRequest,
  getItemRequests,
  updateRequestStatus,
  batchUpdateRequestStatus,
  batchDeleteRequests,
} from "@/server/db/requests";
import {
  validateCreateItemRequest,
  validateEditStatusRequest,
  validateBatchEditRequest,
  validateBatchDeleteRequest,
  isValidStatus,
} from "@/lib/validation/db/requests";
import { RequestStatus } from "@/lib/types/request";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");

  try {
    if (isNaN(page) || page < 1) {
      throw new InputException("Invalid page number");
    }

    const status = statusParam && isValidStatus(statusParam) ? (statusParam as RequestStatus) : null;

    const result = await getItemRequests(status, page);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validatedRequest = validateCreateItemRequest(body);

    if (!validatedRequest) {
      throw new InputException("Invalid request body");
    }

    const newRequest = await createItemRequest(
      validatedRequest.requestorName,
      validatedRequest.itemRequested
    );

    return new Response(JSON.stringify(newRequest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.ids && Array.isArray(body.ids)) {
      const validatedRequest = validateBatchEditRequest(body);
      if (!validatedRequest) {
        throw new InputException("Invalid batch edit request");
      }

      const modifiedCount = await batchUpdateRequestStatus(
        validatedRequest.ids,
        validatedRequest.status
      );

      return new Response(
        JSON.stringify({ modifiedCount, ids: validatedRequest.ids }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedRequest = validateEditStatusRequest(body);
    if (!validatedRequest) {
      throw new InputException("Invalid edit request");
    }

    const updatedRequest = await updateRequestStatus(
      validatedRequest.id,
      validatedRequest.status
    );

    if (!updatedRequest) {
      throw new InputException("Request not found");
    }

    return new Response(JSON.stringify(updatedRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const validatedRequest = validateBatchDeleteRequest(body);

    if (!validatedRequest) {
      throw new InputException("Invalid batch delete request");
    }

    const deletedCount = await batchDeleteRequests(validatedRequest.ids);

    return new Response(
      JSON.stringify({ deletedCount, ids: validatedRequest.ids }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}
