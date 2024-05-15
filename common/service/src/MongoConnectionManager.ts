import wait from '@sellout/utils/.dist/wait';

export default class MongoConnectionManager {
  public connected: boolean;
  public mongoConnectionString: string;
  public isReplicaSet: boolean;
  private mongoose: any;
  private mongoConnectionStringInternal: string;

  constructor(mongoose: any, mongoConnectionString: string, username: string = '', password: string = '') {
    const parsed = new URL(mongoConnectionString);

    parsed.username = username;
    parsed.password = password;
    parsed.pathname = '/admin';

    this.connected = false;
    this.mongoConnectionStringInternal = parsed.toString();
    this.isReplicaSet = parsed.protocol === 'mongodb+srv:';

    // redact username/password from publicly available connection string
    parsed.username = '__user__';
    parsed.password = '__pass__';
    this.mongoConnectionString = parsed.toString();
    this.mongoose = mongoose;
  }

  public async connect() {
    while(!this.connected) {
      console.log('Attempting to connect to Mongo...');
      this.mongoose.connect(this.mongoConnectionStringInternal, {
        ssl: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
        .then(() => {
          this.connected = true;
          console.log(`Connected to MongoDB: ${this.mongoConnectionString}`);
        })
        .catch((e: any) => {
          console.error(`There was an error connecting to MongoDB: ${this.mongoConnectionString}`);
          console.error(e);
        });

      // wait five seconds before trying again
      await wait(5000);
    }
  }
}

