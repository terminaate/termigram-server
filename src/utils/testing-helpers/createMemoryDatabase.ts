// import { MongoMemoryServer } from 'mongodb-memory-server';
// import { connect, Connection } from 'mongoose';
//
// export class MemoryDatabase {
//   mongod: MongoMemoryServer;
//   connection: Connection;
//
//   constructor() {
//     this.connect();
//   }
//
//   private async connect() {
//     this.mongod = await MongoMemoryServer.create();
//     const uri = this.mongod.getUri();
//     const { connection } = await connect(uri);
//     this.connection = connection;
//     console.log(this.connection);
//   }
//
//   async closeDatabase() {
//     console.log(this.connection);
//     await this.connection.dropDatabase();
//     await this.connection.close();
//     await this.mongod.stop();
//   }
//
//   async clearDatabase() {
//     const collections = await this.connection.db.listCollections().toArray();
//
//     for (const collection of collections) {
//       await this.connection.db.dropCollection(collection.name);
//     }
//   }
// }

import { connect, Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function createMemoryDatabase(
  models: Array<{
    name: string;
    schema: Schema;
  }>,
) {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const mongo = await connect(uri);
  await mongo.connection.db.dropDatabase();
  const newModels = {};

  for (let i = 0; i < models.length; i++) {
    newModels[models[i].name] = mongo.model(models[i].name, models[i].schema);
  }

  const clearCollections = async () => {
    const collections = await mongo.connection.db.listCollections().toArray();

    for (const collection of collections) {
      await mongo.connection.db.dropCollection(collection.name);
    }
  };

  const closeDatabase = async () => {
    await clearCollections();
    await mongo.connection.dropDatabase();
    await mongo.disconnect();
    await mongod.stop();
  };

  return { mongod, mongo, models: newModels, clearCollections, closeDatabase };
}
