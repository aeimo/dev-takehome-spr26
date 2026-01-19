import { ObjectId } from "mongodb";
import { RequestStatus } from "./request";

export interface ItemRequest {
  _id?: ObjectId;
  requestorName: string;
  itemRequested: string;
  requestCreatedDate: Date;
  lastEditedDate?: Date;
  status: RequestStatus;
}

export interface CreateItemRequestInput {
  requestorName: string;
  itemRequested: string;
}

export interface EditStatusRequestInput {
  id: string;
  status: RequestStatus;
}

export interface BatchEditRequestInput {
  ids: string[];
  status: RequestStatus;
}

export interface BatchDeleteRequestInput {
  ids: string[];
}
