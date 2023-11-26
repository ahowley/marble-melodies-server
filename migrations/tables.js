/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .createTable("user", (table) => {
      table.increments("id").primary();
      table.string("username").notNullable().unique();
      table.string("password_hash").notNullable();
    })
    .createTable("track", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .unsigned()
        .references("id")
        .inTable("user")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("name").notNullable();
      table.boolean("previewOnPlayback").notNullable();
      table.float("volume").notNullable().checkBetween([0, 1]);
    })
    .createTable("body", (table) => {
      table.increments("id").primary();
      table.string("type").notNullable();
      table.double("x").notNullable();
      table.double("y").notNullable();
      table.double("rotation").notNullable();
      table.double("radius");
      table.double("width");
      table.double("height");
      table.string("frontColor");
      table.string("backColor");
      table.string("gradientStart");
      table.string("gradientEnd");
      table.boolean("isStatic");
      table.string("note");
      table.string("octave");
      table.float("volume").notNullable().checkBetween([0, 1]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTable("track").dropTable("user").dropTable("body");
};