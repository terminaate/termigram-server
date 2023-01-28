import { connect, Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

type Model = {
  name: string;
  schema: Schema;
};

export class MemoryDatabase {
  models: Record<string, unknown> = {};

  constructor(
    models: Model[],
    public mongod: MongoMemoryServer,
    public mongo: Awaited<ReturnType<typeof connect>>,
  ) {}

  static async create(models: Model[]) {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const mongo = await connect(uri);
    await mongo.connection.db.dropDatabase();
    return new MemoryDatabase(models, mongod, mongo);
  }

  public async clearCollections() {
    const collections = await this.mongo.connection.db
      .listCollections()
      .toArray();

    for (const collection of collections) {
      await this.mongo.connection.db.dropCollection(collection.name);
    }
  }

  public async closeDatabase() {
    await this.clearCollections();
    await this.mongo.connection.dropDatabase();
    await this.mongo.disconnect();
    await this.mongod.stop();
  }

  private initModels(models: Model[]) {
    for (const model of models) {
      this.models[model.name] = this.mongo.model(model.name, model.schema);
    }
  }
}
