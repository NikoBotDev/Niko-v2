import { Provider } from 'discord-akairo';
import { BaseEntity, getManager, FindOneOptions } from 'typeorm';

interface ProviderOptions {
  idColumn?: string;
  dataColumn: string;
}

/**
 * Provider using the `sequelize` library.
 */
export default class TypeORMProvider extends Provider {
  public table: typeof BaseEntity;
  public idColumn: string;
  public dataColumn: string;
  constructor(
    table: typeof BaseEntity,
    { idColumn = 'id', dataColumn }: ProviderOptions
  ) {
    super();

    /**
     * Sequelize model.
     */
    this.table = table;

    /**
     * Column for ID.
     */
    this.idColumn = idColumn;

    /**
     * Column for JSON data.
     */
    this.dataColumn = dataColumn;
  }

  /**
   * Initializes the provider.
   * @returns {Bluebird<void>}
   */
  async init() {
    const entityManager = getManager();

    const rows = await entityManager.find<{ [x: string]: string } & BaseEntity>(
      this.table
    );
    for (const row of rows) {
      this.items.set(
        row[this.idColumn],
        this.dataColumn ? JSON.parse(row[this.dataColumn]) : row
      );
    }
  }

  /**
   * Gets a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to get.
   * @param {any} [defaultValue] - Default value if not found or null.
   * @returns {any}
   */
  get<T>(id: string, key: string, defaultValue?: T): T | undefined {
    if (this.items.has(id)) {
      const value = this.items.get(id)[key];
      return value == null ? defaultValue : value;
    }

    return defaultValue;
  }

  /**
   * Sets a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to set.
   * @param {any} value - The value.
   * @returns {Bluebird<boolean>}
   */
  set(id: string, key: string, value: any) {
    const data = this.items.get(id) || {};

    data[key] = value;
    this.items.set(id, data);

    if (this.dataColumn) {
      return this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [this.dataColumn]: data,
        }
      );
    }

    return this.upsert(
      {
        [this.idColumn]: id,
      },
      {
        [key]: value,
      }
    );
  }

  /**
   * Deletes a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to delete.
   * @returns {Bluebird<boolean>}
   */
  delete(id: string, key: string) {
    const data = this.items.get(id) || {};
    delete data[key];

    if (this.dataColumn) {
      return this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [this.dataColumn]: data,
        }
      );
    }

    return this.upsert(
      {
        [this.idColumn]: id,
      },
      {
        [key]: null,
      }
    );
  }

  /**
   * Clears an entry.
   * @param {string} id - ID of entry.
   * @returns {Bluebird<void>}
   */
  clear(id: string) {
    this.items.delete(id);
    const entityManager = getManager();
    return entityManager.delete(this.table, id);
  }

  private async upsert(
    options: FindOneOptions<BaseEntity>,
    updateOptions: any
  ) {
    updateOptions.settings = JSON.stringify(updateOptions.settings);
    const entityManager = getManager();

    try {
      const item = await entityManager.findOne(this.table, options);
      if (item) {
        await entityManager.update(this.table, item, updateOptions);
      } else {
        await entityManager.insert(this.table, {
          ...options,
          ...updateOptions,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
