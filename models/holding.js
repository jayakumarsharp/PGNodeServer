"use strict"

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related functions for holdings. */

class Holding {
  /** Create a holding, update db, return new holding data.
   * 
   * data should be { symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
   * 
   * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
   * 
   * Throws NotFoundError if portfolio doesn't exist
   * Throws BadRequestError if holding already exists in portfolio
   */

  static async create({ symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }) {
    const portfolioCheck = await db.query(
      `SELECT id
       FROM portfolios
       WHERE id = $1`,
      [portfolio_id]
    );

    if (!portfolioCheck.rows[0])
      throw new NotFoundError(`Invalid portfolio: ${portfolio_id}`);

    const duplicateCheck = await db.query(
      `SELECT symbol
       FROM holdings
       WHERE symbol = $1 AND portfolio_id = $2`,
      [symbol, portfolio_id]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate holding: ${symbol}`);

    const result = await db.query(
      `INSERT INTO holdings
       (symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id`,
      [symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id]
    );
    const holding = result.rows[0];

    return holding;
  }

  /** Given a holding id, return data about the holding 
   * 
   * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
   * 
   * Throws NotFoundError if not found.
   */

  static async get(id) {
    const holdingRes = await db.query(
      `SELECT id, 
              symbol,
              shares_owned,
              cost_basis,
              target_percentage,
              goal,
              portfolio_id
       FROM holdings
       WHERE id = $1`, [id]);
    const holding = holdingRes.rows[0];

    if (!holding) throw new NotFoundError(`No holding: ${id}`);
    return holding;
  }

  /** Update holding data with `data`. 
   * 
   * This is a "partial update" -- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   * 
   * Data can include: { shares_owned, cost_basis, target_percentage, goal }
   * 
   * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
   * 
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE holdings
                      SET ${setCols}
                      WHERE id = ${idIdx}
                      RETURNING id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id`;
    const result = await db.query(querySql, [...values, id]);
    const holding = result.rows[0];

    if (!holding) throw new NotFoundError(`No holding: ${id}`);

    return holding;
  }

  /** Delete given holding from database; returns undefined.
   * 
   * Throws NotFoundError if holding not found.
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM holdings
       WHERE id = $1
       RETURNING id`, [id]
    );
    const holding = result.rows[0];

    if (!holding) throw new NotFoundError(`No holding: ${id}`);
  }
}

module.exports = Holding;