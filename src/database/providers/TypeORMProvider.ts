/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'discord-akairo';
import { BaseEntity, FindOneOptions } from 'typeorm';
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
   */
  async init() {
    const rows = await this.table.find<{ [x: string]: string } & BaseEntity>();

    rows.forEach(row =>
      this.items.set(
        row[this.idColumn],
        this.dataColumn ? row[this.dataColumn] : row,
      ),
    );
  }

  /**
   * Gets a value.
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
   */
  public clear(id: string) {
    this.items.delete(id);
    return this.table.delete(id);
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
