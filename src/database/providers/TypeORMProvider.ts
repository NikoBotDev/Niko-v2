/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'discord-akairo';
import { BaseEntity, getManager, FindOneOptions } from 'typeorm';

interface ProviderOptions {
  idColumn?: string;
  dataColumn: string;
}

/**
 * Provider using the `typeorm` library.
 */
export default class TypeORMProvider extends Provider {
  public table: typeof BaseEntity;

  public idColumn: string;

  public dataColumn: string;

  constructor(
    table: typeof BaseEntity,
    { idColumn = 'id', dataColumn }: ProviderOptions,
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
      this.table,
    );

    rows.forEach(row =>
      this.items.set(
        row[this.idColumn],
        this.dataColumn ? row[this.dataColumn] : row,
      ),
    );
  }

  /**
   * Gets a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to get.
   * @param {any} [defaultValue] - Default value if not found or null.
   * @returns {any}
   */
  public get<T>(id: string, key: string, defaultValue?: T): T | undefined {
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
  public set(id: string, key: string, value: unknown) {
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
        },
      );
    }

    return this.upsert(
      {
        [this.idColumn]: id,
      },
      {
        [key]: value,
      },
    );
  }

  /**
   * Deletes a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to delete.
   * @returns {Bluebird<boolean>}
   */
  public delete(id: string, key: string) {
    const data = this.items.get(id) || {};
    delete data[key];

    if (this.dataColumn) {
      return this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [this.dataColumn]: data,
        },
      );
    }

    return this.upsert(
      {
        [this.idColumn]: id,
      },
      {
        [key]: null,
      },
    );
  }

  /**
   * Clears an entry.
   * @param {string} id - ID of entry.
   * @returns {Bluebird<void>}
   */
  public clear(id: string) {
    this.items.delete(id);
    const entityManager = getManager();
    return entityManager.delete(this.table, id);
  }

  private async upsert(
    options: FindOneOptions<BaseEntity>,
    updateOptions: any,
  ) {
    try {
      const insertValues = Object.assign(options, updateOptions);
      this.table
        .createQueryBuilder()
        .insert()
        .values(insertValues)
        .onConflict(
          `(${this.idColumn}) DO UPDATE SET "${
            this.dataColumn
          }" = '${JSON.stringify(updateOptions[this.dataColumn])}'`,
        )
        .returning(this.dataColumn)
        .execute();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
