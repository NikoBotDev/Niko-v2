/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'discord-akairo';
import { BaseEntity, getManager, FindOneOptions, DeepPartial } from 'typeorm';
import { Settings } from '@entities/Setting';

interface ProviderOptions {
  idColumn?: string;
  dataColumn: string;
}

/**
 * Provider using the `typeorm` library.
 */
export default class TypeORMProvider extends Provider {
  public table: typeof BaseEntity;

  public readonly idColumn!: string;

  public readonly dataColumn!: string;

  constructor(
    table: typeof BaseEntity,
    { idColumn = 'id', dataColumn = 'settings' }: ProviderOptions,
  ) {
    super();

    /**
     * Sequelize model.
     */
    this.table = table;

    /**
     * Column for ID.
     */
    Object.defineProperty(this, 'idColumn', {
      value: idColumn,
      writable: false,
    });

    /**
     * Column for JSON data.
     */
    Object.defineProperty(this, 'dataColumn', {
      value: dataColumn,
      writable: false,
    });
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
   * @param {keyof Settings} key - The key to get.
   * @param {any} [defaultValue] - Default value if not found or null.
   * @returns {any}
   */
  public get<T>(
    id: string,
    key: keyof Settings,
    defaultValue?: T,
  ): T | undefined {
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
  public set(id: string, key: keyof Settings, value: unknown) {
    const data = this.items.get(id) || {};

    data[key] = value;

    if (this.dataColumn) {
      this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [this.dataColumn]: data,
        },
      );
    } else {
      this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [key]: value,
        },
      );
    }

    this.items.set(id, data);
    return true;
  }

  /**
   * Deletes a value.
   * @param {string} id - ID of entry.
   * @param {string} key - The key to delete.
   * @returns {Bluebird<boolean>}
   */
  public delete(id: string, key: keyof Settings) {
    const data = this.items.get(id) || {};
    delete data[key];

    if (this.dataColumn) {
      this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [this.dataColumn]: data,
        },
      );
    } else {
      this.upsert(
        {
          [this.idColumn]: id,
        },
        {
          [key]: null,
        },
      );
    }

    this.items.set(id, data);
    return true;
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
        .execute();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
