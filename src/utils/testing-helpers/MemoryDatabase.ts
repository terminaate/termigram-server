import { connect, Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

type Model = {
  name: string;
  schema: Schema;
};

export class MemoryDatabase {
  mongod: MongoMemoryServer;
  uri: string;
  mongo: Awaited<ReturnType<typeof connect>>;
  models: Record<string, unknown> = {};

  constructor(models: Model[]) {
    void this.init();
    this.initModels(models);
  }

  private async init() {
    this.mongod = await MongoMemoryServer.create();
    this.uri = this.mongod.getUri();
    this.mongo = await connect(this.uri);
    await this.mongo.connection.db.dropDatabase();
  }

  private initModels(models: Model[]) {
    for (const model of models) {
      this.models[model.name] = this.mongo.model(model.name, model.schema);
    }
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
}
