import { RequestStatus } from "@/lib/types/request";
import {
  CreateItemRequestInput,
  EditStatusRequestInput,
  BatchEditRequestInput,
  BatchDeleteRequestInput,
} from "@/lib/types/db/request";

function isValidString(str: unknown, lower?: number, upper?: number): boolean {
  if (typeof str !== "string" || str.trim() === "") {
    return false;
  }
  if ((lower && str.length < lower) || (upper && str.length > upper)) {
    return false;
  }
  return true;
}

function isValidName(name: string): boolean {
  return isValidString(name, 3, 30);
}

function isValidItemRequested(item: string): boolean {
  return isValidString(item, 2, 100);
}

export function isValidStatus(status: unknown): boolean {
  return (
    isValidString(status) &&
    Object.values(RequestStatus).includes(status as RequestStatus)
  );
}

export function isValidObjectId(id: unknown): boolean {
  return typeof id === "string" && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
}

export function validateCreateItemRequest(
  request: unknown
): CreateItemRequestInput | null {
  if (!request || typeof request !== "object") {
    return null;
  }

  const req = request as Record<string, unknown>;

  if (!req.requestorName || !req.itemRequested) {
    return null;
  }

  if (
    !isValidName(req.requestorName as string) ||
    !isValidItemRequested(req.itemRequested as string)
  ) {
    return null;
  }

  return {
    requestorName: req.requestorName as string,
    itemRequested: req.itemRequested as string,
  };
}

export function validateEditStatusRequest(
  request: unknown
): EditStatusRequestInput | null {
  if (!request || typeof request !== "object") {
    return null;
  }

  const req = request as Record<string, unknown>;

  if (!req.id || !req.status) {
    return null;
  }

  if (!isValidObjectId(req.id) || !isValidStatus(req.status)) {
    return null;
  }

  return {
    id: req.id as string,
    status: req.status as RequestStatus,
  };
}

export function validateBatchEditRequest(
  request: unknown
): BatchEditRequestInput | null {
  if (!request || typeof request !== "object") {
    return null;
  }

  const req = request as Record<string, unknown>;

  if (!Array.isArray(req.ids) || !req.status) {
    return null;
  }

  if (req.ids.length === 0 || !req.ids.every(isValidObjectId)) {
    return null;
  }

  if (!isValidStatus(req.status)) {
    return null;
  }

  return {
    ids: req.ids as string[],
    status: req.status as RequestStatus,
  };
}

export function validateBatchDeleteRequest(
  request: unknown
): BatchDeleteRequestInput | null {
  if (!request || typeof request !== "object") {
    return null;
  }

  const req = request as Record<string, unknown>;

  if (!Array.isArray(req.ids)) {
    return null;
  }

  if (req.ids.length === 0 || !req.ids.every(isValidObjectId)) {
    return null;
  }

  return {
    ids: req.ids as string[],
  };
}
