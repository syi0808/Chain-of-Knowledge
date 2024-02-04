const DB_NAME = 'COK';
const DB_VERSION = 1;

class IndexedDB {
  #instance: IDBDatabase;
  initialized = false;

  constructor(onSuccess: (instance: IndexedDB) => void, onError?: (error: string) => void) {
    // Access to Instance's property will be blocked by preventInitialization decorator.
    this.#instance = {} as IDBDatabase;

    (async () => {
      try {
        const request = await indexedDBOpen(DB_NAME, DB_VERSION);

        this.#instance = request;

        this.initialized = true;
        onSuccess(this);
      } catch (error) {
        const message = (error as DOMException | null)?.message ?? 'Unknown Error (in indexedDBOpen function)';

        onError?.(message);
        throw new Error(message);
      }
    })();
  }

  @preventInitialization
  get() {
    console.log('GET');
  }

  @preventInitialization
  set() {
    console.log('SET');
  }
}

async function indexedDBOpen(...[name, version]: Parameters<typeof indexedDB.open>) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function preventInitialization(_target: IndexedDB, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originMethod = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    if (!(this as IndexedDB).initialized) {
      throw new Error('IndexedDB is not opened.');
    }

    originMethod.apply(this, ...args);
  };
}

export default IndexedDB;

export const createIDB = async () => {
  return new Promise<IndexedDB>((resolve, reject) => {
    new IndexedDB(resolve, reject);
  });
};
