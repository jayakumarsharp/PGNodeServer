"use strict"

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related functions for portfolios. */

class Portfolio {
  /** Create a portfolio, update db, return new portfolio data.
   * 
   * data should be { name, cash, notes, username }
   * 
   * Returns { id, name, cash, notes, username }
   * 
   * Throws BadRequestError if portfolio already exists for user
   */

  static async create({ name, cash, notes, username }) {
    const duplicateCheck = await db.query(
      `SELECT name
       FROM portfolios
       WHERE name = $1 AND username = $2`,
      [name, username]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate name: ${name}`);

    const result = await db.query(
      `INSERT INTO portfolios
       (name, cash, notes, username)
       VALUES ($1,  $2, $3, $4)
       RETURNING id, name, cash, notes, username`,
      [
        name,
        cash,
        notes,
        username,
      ]
    );
    const portfolio = result.rows[0];

    return portfolio;
  }

  /** Given a portfolio id, return data about portfolio
   * 
   * Returns { id, name, cash, notes, username, holdings }
   *   where holdings is [{ id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }, ...]
   * 
   * Throws NotFoundError if not found.
   */

  static async get(id) {
    const portfolioRes = await db.query(
      `SELECT id,
              name,
              cash,
              notes,
              username
       FROM portfolios
       WHERE id = $1`, [id]);
    const portfolio = portfolioRes.rows[0];

    if (!portfolio) throw new NotFoundError(`No portfolio: ${id}`);

    const holdingsRes = await db.query(
      `SELECT id,
              symbol,
              shares_owned,
              cost_basis,
              target_percentage,
              goal,
              portfolio_id
       FROM holdings
       WHERE portfolio_id = $1`, [id]);

    portfolio.holdings = holdingsRes.rows;
    return portfolio;
  }

  /** Update portfolio data with `data`.
   * 
   * This is a "partial update" --- it's fine if data doesn't contain all the 
   * fields; this only changes provided ones.
   * 
   * Data can include: { name, cash, notes }
   * 
   * Returns { id, name, cash, notes, username }
   * 
   * Throws NotFoundError if not found.
   */

  static async update(id, data, username) {
    console.log(data);
    console.log(username);
    if (data.name) {
      const duplicateCheck = await db.query(
        `SELECT name
       FROM portfolios
       WHERE name = $1 AND username = $2`,
        [data.name, username]);

      if (duplicateCheck.rows[0])
        throw new BadRequestError(`Duplicate name: ${data.name}`);
    }

    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE portfolios
                      SET ${setCols}
                      WHERE id = ${idIdx}
                      RETURNING id,
                                name,
                                cash,
                                notes,
                                username`;
    const result = await db.query(querySql, [...values, id]);
    const portfolio = result.rows[0];

    if (!portfolio) throw new NotFoundError(`No portfolio: ${id}`);

    return portfolio;
  }

  /** Delete given portfolio from datbase; returns undefined.
   * 
   * Throws NotFoundError if portfolio not found.
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM portfolios
       WHERE id = $1
       RETURNING id`,
      [id]);
    const portfolio = result.rows[0];

    if (!portfolio) throw new NotFoundError(`No portfolio: ${id}`);
  }
}

module.exports = Portfolio;