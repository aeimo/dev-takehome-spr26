import { MongoClient, Db, ObjectId } from "mongodb";

const uri = "mongodb+srv://jameschen0831_db_user:james@bog.oxwyzuz.mongodb.net/?appName=BOG";
const dbName = "crisis_corner";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

export { ObjectId };
