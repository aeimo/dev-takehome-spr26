import { connectToDatabase, ObjectId } from "@/lib/db/mongodb";
import { ItemRequest } from "@/lib/types/db/request";
import { RequestStatus } from "@/lib/types/request";
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";

const COLLECTION_NAME = "requests";

export async function createItemRequest(
  requestorName: string,
  itemRequested: string
): Promise<ItemRequest> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const date = new Date();
  const newRequest: ItemRequest = {
    requestorName,
    itemRequested,
    requestCreatedDate: date,
    lastEditedDate: date,
    status: RequestStatus.PENDING,
  };

  const result = await collection.insertOne(newRequest);
  return { ...newRequest, _id: result.insertedId };
}

export async function getItemRequests(
  status: RequestStatus | null,
  page: number
): Promise<{ data: ItemRequest[]; total: number; totalPages: number }> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const filter = status ? { status } : {};
  const total = await collection.countDocuments(filter);

  const skip = (page - 1) * PAGINATION_PAGE_SIZE;
  const data = await collection
    .find(filter)
    .sort({ requestCreatedDate: -1 })
    .skip(skip)
    .limit(PAGINATION_PAGE_SIZE)
    .toArray();

  const totalPages = Math.ceil(total / PAGINATION_PAGE_SIZE);

  return { data, total, totalPages };
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<ItemRequest | null> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, lastEditedDate: new Date() } },
    { returnDocument: "after" }
  );

  return result || null;
}

export async function batchUpdateRequestStatus(
  ids: string[],
  status: RequestStatus
): Promise<number> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const objectIds = ids.map((id) => new ObjectId(id));
  const result = await collection.updateMany(
    { _id: { $in: objectIds } },
    { $set: { status, lastEditedDate: new Date() } }
  );

  return result.modifiedCount;
}

export async function batchDeleteRequests(ids: string[]): Promise<number> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const objectIds = ids.map((id) => new ObjectId(id));
  const result = await collection.deleteMany({ _id: { $in: objectIds } });

  return result.deletedCount;
}

export async function deleteAllRequests(): Promise<number> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const result = await collection.deleteMany({});
  return result.deletedCount;
}

export async function getRequestById(id: string): Promise<ItemRequest | null> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const request = await collection.findOne({ _id: new ObjectId(id) });
  return request;
}

export async function getAllRequests(): Promise<ItemRequest[]> {
  const db = await connectToDatabase();
  const collection = db.collection<ItemRequest>(COLLECTION_NAME);

  const requests = await collection
    .find({})
    .sort({ requestCreatedDate: -1 })
    .toArray();

  return requests;
}
